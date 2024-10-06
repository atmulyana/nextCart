/** 
 * https://github.com/atmulyana/nextCart
 **/
import type {NextRequest} from 'next/server';
import {headers as nextHeaders} from 'next/headers';
import {redirect as nextRedirect, RedirectType} from 'next/navigation';
import config from '@/config/usable-on-client';
import {getCart} from '@/data/cart';
import {getSession} from '@/data/session';
import {title} from '@/app/(shop)/layout';
import {getSessionMessage} from './auth';
import {isFromMobile as fromMobile} from './auth/common';
import {isPlainObject, normalizeParamValue, safeUrl, type GetParam, type RouteParam} from './common';

type RedirectOption = NonNullable<Parameters<typeof safeUrl>[1]>;
export type Redirect = (url: any, option?: RedirectOption) => any;

export type HandlerParams<P extends GetParam = {}, S extends GetParam = {}> = RouteParam<P, S> & {
    redirect?: Redirect,
    isFromMobile?: boolean,
    headers?: Headers,
}
type GetHandler<P extends GetParam, S extends GetParam, R> = (reqParam: Required<HandlerParams<P, S>>) => R;
type GetRouteHandler<P extends GetParam, S extends GetParam, R> = {
    (request: NextRequest, context: {params: P}): Promise<Response>,
    data: (args: HandlerParams<P, S>) => Promise<R extends Promise<any> ? Awaited<R> : R>,
};

type PostHandler = (formData: FormData, redirect: Redirect, isFromMobile: boolean) => any;
type PostRouteHandler = {
    (request: Request): Promise<Response>,
    response: (formData: FormData) => Promise<Response>,
    responseJson: <T = any>(formData: FormData) => Promise<T>,
};

export function redirect(url: any, option?: RedirectOption) {
    const Url = safeUrl(url, option);
    nextRedirect(Url.pathname + Url.search, RedirectType.replace);
}

function createRedirect(baseUrl?: string) {
    return (url: any, option?: RedirectOption) => {
        return Response.redirect(safeUrl(
            url, 
            {
                base: baseUrl,
                ...(typeof(option) == 'string' ? {default: option} : option)
            })
        );
    };
}

async function applyCommonMobileData(response: any, isGet: boolean = false) {
    if (isPlainObject(response)) {
        const {discount, items = {}, ...cart} = (
            (
                ('cart' in response) ? response.cart : await getCart()
            ) ?? {} 
        ) as Partial<NonNullable<Awaited<ReturnType<typeof getCart>>>>;
        
        response.session = {
            ...(await getSession()),
            ...cart,
            discountCode: typeof(discount) == 'string' ? discount : discount?.code,
            cart: items,
            ...response.session,
        };
        response.config = config;
        
        const sessionMessage = await getSessionMessage();
        if (sessionMessage.message) {
            response.message = sessionMessage.message;
            response.messageType = sessionMessage.type ?? 'danger';
        }

        if ('cart' in response) {
            response.totalCartItems = cart.totalCartItems ?? 0;
            delete response.cart;
        }
        if (isGet) {
            if (typeof(response.title) == 'undefined') response.title = title;
        }
    }
}

export function createGetHandler<P extends GetParam, S extends GetParam, R = any>(handler: GetHandler<P, S, R>): GetRouteHandler<P, S, R> {
    type _R = R extends Promise<any> ? Awaited<R> : R;
    async function getData(
        {
            params = {} as P,
            searchParams = {} as S,
            redirect: _redirect = redirect,
            isFromMobile = false,
            headers = nextHeaders(),
        }: HandlerParams<P, S>
    ): Promise<_R> {
        normalizeParamValue(params);
        normalizeParamValue(searchParams);
        let response = handler({params, searchParams, redirect: _redirect, isFromMobile, headers});
        if (response instanceof Promise) response = await response;
        if (isFromMobile) await applyCommonMobileData(response, true);
        return response as _R;
    }

    async function GET(
        request: NextRequest,
        {params}: {params?: P} = {}
    ) {
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

        const _redirect = createRedirect(request.url);
        const isFromMobile = fromMobile(request.headers);
        
        const data = await getData({
            params: (params || {}) as P,
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

export function createPostHandler(handler: PostHandler): PostRouteHandler {
    async function submit(formData: FormData, _redirect: Redirect = redirect, isFromMobile: boolean = false): Promise<Response> {
        let response: any = handler(formData, _redirect, isFromMobile);
        if (response instanceof Promise) response = await response;
        if (isFromMobile) await applyCommonMobileData(response);
        return response instanceof Response ? response :
               isPlainObject(response)      ? Response.json(response) :       
                                              Response.json({});
    }
    
    async function POST(request: Request) {
        const contentType = request.headers.get('Content-Type');
        let formData = new FormData();
        if (contentType?.toLowerCase().endsWith('/json')) {
            try {
                const params = await request.json();
                if (typeof(params) == 'object') {
                    for (let p in params) {
                        formData.set(p, String(params[p]))
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
        
        const _redirect = createRedirect(request.url);
        const isFromMobile = fromMobile(request.headers);
        return await submit(formData, _redirect, isFromMobile);
    }
    POST.response = submit;
    POST.responseJson = async <T>(formData: FormData) => {
        const response = await submit(formData);
        return (await response.json()) as T;
    };

    return POST;
}