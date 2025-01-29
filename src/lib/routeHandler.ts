/** 
 * https://github.com/atmulyana/nextCart
 **/
import {NextRequest} from 'next/server';
import {headers as nextHeaders} from 'next/headers';
import {redirect as nextRedirect, RedirectType} from 'next/navigation';
import {getRedirectError} from 'next/dist/client/components/redirect';
import config from '@/config';
import {getCart} from '@/data/cart';
import {getSession, refreshSessionExpires} from '@/data/session';
import type {NotificationParam} from '@/subview/components/Notification';
import {title} from '@/app/(shop)/layout';
import {getSessionMessage, redirectWithMessage} from './auth';
import {isFromMobile as fromMobile} from './auth/common';
import {isPlainObject, normalizeParamValue, safeUrl, type GetParam, type RouteParam} from './common';
import {validateForm} from './schemas';

type RedirectOption = Exclude<NonNullable<Parameters<typeof safeUrl>[1]>, string> & {
    message?: string,
    messageType?: NotificationParam['type'],
} | string;
export type Redirect = <T extends RedirectOption>(url: any, option?: T) => (
    T extends {message: string} ? Promise<never> : (Response | never)
);

export type HandlerParams<P extends GetParam = {}, S extends GetParam = {}> = RouteParam<P, S> & {
    redirect?: Redirect,
    isFromMobile?: boolean,
    headers?: Headers,
}
type GetHandler<P extends GetParam, S extends GetParam, R> = (reqParam: Required<HandlerParams<P, S>>) => Promise<R>;
type GetRouteHandler<P extends GetParam, S extends GetParam, R> = {
    (request: NextRequest, context: {params: Promise<P>}): Promise<Response>,
    data: (args: HandlerParams<P, S>) => Promise<R>,
};

type PostHandler = (formData: FormData, redirect: Redirect, isFromMobile: boolean) => Promise<any>;
type PostRouteHandler<P extends GetParam, R> = {
    (request: NextRequest, context: {params: Promise<P>}): Promise<Response>,
    response: (formData: FormData) => Promise<Response>,
    responseJson: (formData: FormData) => Promise<R>,
};

export const redirect = ((url: any, option?: RedirectOption) => {
    const Url = safeUrl(url, option);
    const sUrl = Url.pathname + Url.search;
    if (typeof(option) == 'object' && option?.message)
        return redirectWithMessage(sUrl, {
            message: option.message,
            type: option.messageType || 'danger'
        })
    else
        return nextRedirect(sUrl, RedirectType.replace);
}) as Redirect;

function createRedirect(reqUrl: NextRequest['nextUrl'], isPost: boolean = false) {
    return ((url: string | URL, option?: RedirectOption) => {
        const Url = safeUrl(
            url, 
            {
                base: reqUrl,
                ...(typeof(option) == 'string' ? {default: option} : option),
            }
        );
        
        if (typeof(option) == 'object' && option?.message) {
            return redirectWithMessage(
                reqUrl.basePath ? `${Url.pathname}${Url.search}` : `${config.baseUrl.path}${Url.pathname}${Url.search}`, 
                {
                    message: option.message,
                    type: option.messageType || 'danger'
                }
            );
        }

        if (Url.host != config.baseUrl.host || Url.protocol != config.baseUrl.protocol) {
            Url.pathname = `${config.baseUrl.path}${Url.pathname}`;
            return Response.redirect(Url);
        }

        if (isPost) throw getRedirectError(Url.pathname, RedirectType.replace, 303);
        return redirect(Url.pathname, RedirectType.replace);
    }) as Redirect;
}

async function applyCommonMobileData(response: any, isGet: boolean = false) {
    if (isPlainObject(response)) {
        const {discount, items = {}, totalCartItems: cartItemCount, ...cart} = (
            (
                ('cart' in response) ? response.cart : await getCart()
            ) ?? {} 
        ) as Partial<NonNullable<Awaited<ReturnType<typeof getCart>>>>;
        
        const sess = await getSession();
        response.session = {
            ...response.session,
            ...sess,
            customerPresent: sess.customerPresent,
            userPresent: sess.userPresent,
            ...cart,
            cartItemCount,
            discountCode: typeof(discount) == 'string' ? discount : discount?.code,
            cart: items,
        };
        response.config = config;
        
        const sessionMessage = await getSessionMessage();
        if (sessionMessage.message) {
            response.message = sessionMessage.message;
            response.messageType = sessionMessage.type ?? 'danger';
        }

        if ('cart' in response) {
            response.totalCartItems = cartItemCount ?? 0;
            delete response.cart;
        }
        if (isGet) {
            if (typeof(response.title) == 'undefined') response.title = title;
        }
    }
    return response;
}

export function createGetHandler<P extends GetParam, S extends GetParam, R = any>(handler: GetHandler<P, S, R>): GetRouteHandler<P, S, R> {
    async function getData(
        {
            params = {} as P,
            searchParams = {} as S,
            redirect: _redirect = redirect,
            isFromMobile = false,
            headers,
        }: HandlerParams<P, S>
    ): Promise<R> {
        if (!headers) headers = await nextHeaders();
        normalizeParamValue(params);
        normalizeParamValue(searchParams);
        let response = await handler({params, searchParams, redirect: _redirect, isFromMobile, headers}) ?? {};
        if (isFromMobile) {
            await refreshSessionExpires();
            await applyCommonMobileData(response, true);
        }
        return response as R;
    }

    async function GET(
        request: NextRequest,
        context: {params: Promise<P>}
    ) {
        const params: GetParam = await context.params || {};
        const searchParams: GetParam = {};
        request.nextUrl.searchParams.forEach((value, key) => {
            if (key in searchParams) {
                if (Array.isArray(searchParams[key])) {
                    (searchParams[key] as string[]).push(value)
                } else {
                    searchParams[key] = [
                        searchParams[key] as string,
                        value
                    ];
                }
            }
            else {
                searchParams[key] = value;
            }
        });

        const _redirect = createRedirect(request.nextUrl);
        const isFromMobile = await fromMobile(request.headers);
        
        const data = await getData({
            params: params as P,
            searchParams: searchParams as S,
            redirect: _redirect,
            isFromMobile,
            headers: request.headers,
        });
        if (data instanceof Response) return data;
        return Response.json(data);
    }
    GET.data = async function(params: HandlerParams<P, S>) {
        return await getData(params);
    }
    
    return GET;
}

export function createPostHandler<P extends GetParam = {}, R = any>(handler: PostHandler): PostRouteHandler<P, R> {
    async function submit(formData: FormData, _redirect: Redirect = redirect, isFromMobile: boolean = false): Promise<Response> {
        let response: any = await handler(formData, _redirect, isFromMobile);
        if (isFromMobile) await applyCommonMobileData(response);
        return response instanceof Response ? response :
               isPlainObject(response)      ? Response.json(response) :       
                                              Response.json({});
    }
    
    async function POST(request: NextRequest, context: {params: Promise<P>}) {
        const params: GetParam = await context.params || {};
        const contentType = request.headers.get('Content-Type');
        let formData = new FormData();
        if (contentType?.toLowerCase().endsWith('/json')) {
            try {
                const params = await request.json();
                if (typeof(params) == 'object') {
                    for (let p in params) {
                        const values = Array.isArray(params[p]) ? params[p] : [ params[p] ];
                        for (let val of values) formData.append(p, String(val))
                    }
                }
            }
            catch {
            }
        }
        else {
            try {
                formData = await request.formData();
            }
            catch {
            }
        }

        for (let p in params) {
            const values = Array.isArray(params[p]) ? params[p] : [ params[p] ];
            for (let val of values) if (val) formData.append(p, String(val))
        }
        
        const isFromMobile = await fromMobile(request.headers);
        
        if (isFromMobile) {
            const schemaName = formSchemas[request.nextUrl.pathname];
            if (schemaName) {
                const validation = await validateForm(schemaName, formData);
                if (!validation.success) {
                    const validationData: {
                        success: false,
                        message?: string,
                        inputMessages: {[name: string]: string},
                    } = {
                        success: false,
                        inputMessages: {},
                    };
                    if ('message' in validation) validationData.message = validation.message;
                    if ('messages' in validation) validationData.inputMessages = validation.messages;
                    return Response.json({
                        ...(await applyCommonMobileData({})),
                        __validation__: validationData,
                    });
                }
            }
        }
        
        const _redirect = createRedirect(request.nextUrl, true);
        return await submit(formData, _redirect, isFromMobile);
    }
    POST.response = submit;
    POST.responseJson = async (formData: FormData) => {
        const response = await submit(formData);
        return (await response.json()) as R;
    };

    return POST;
}

const formSchemas: {[path: string]: string} = {
    '/admin/login_action': 'login',
    '/customer/login_action': 'login',
    '/customer/create': 'checkoutInfo',
    '/customer/save': 'checkoutInfo',
    '/customer/update': 'checkoutInfo',
    '/customer/forgotten_action': 'forgottenPassword',
    '/customer/reset': 'resetPassword', //TODO: prefix of path
    '/product/addreview' : 'review',
};