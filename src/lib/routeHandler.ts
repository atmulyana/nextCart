/** 
 * https://github.com/atmulyana/nextCart
 **/
import type {NextRequest} from 'next/server';
import {redirect as nextRedirect, RedirectType} from 'next/navigation';
import config from '@/config/usable-on-client';
import {getCart} from '@/data/cart';
import {getSession} from '@/data/session';
import {title} from '@/app/(shop)/layout';
import {getSessionMessage} from './auth';
import {isPlainObject, normalizeParamValue, type GetParam, type RouteParam} from './common';

export type Redirect = (url: any, defaultUrl?: string) => any;

export type HandlerParams<P extends GetParam = {}, S extends GetParam = {}> = RouteParam<P, S> & {
    redirect: Redirect,
    isFromMobile: boolean,
}
type GetHandler<P extends GetParam, S extends GetParam, R> = (reqParam: HandlerParams<P, S>) => R;
type GetRouteHandler<P extends GetParam, S extends GetParam, R> = {
    (request: NextRequest, context: {params: P}): Promise<Response>,
    data: (args: Parameters<GetHandler<P, S, R>>[0]) => Promise<R extends Promise<any> ? Awaited<R> : R>,
};

type PostHandler = (formData: FormData, redirect: Redirect, isFromMobile: boolean) => any;
type PostRouteHandler = {
    (request: Request): Promise<Response>,
    response: (formData: FormData) => Promise<Response>,
    responseJson: <T>(formData: FormData) => Promise<T>,
};

function safeUrl(url: any, option: {base?: string | URL, default?: string} | string = {}) {
    if (typeof(option) == 'string') option = {default: option};
    const baseUrl = new URL(option.base || 'http://localhost');
    const defaultUrl = new URL('/', baseUrl);
    let Url = typeof(url) == 'string' ? new URL(url.trim() || option.default?.trim() || '/', baseUrl) :
              url instanceof URL      ? url :
                                        defaultUrl;
    if (
        Url.host != baseUrl.host ||
        Url.protocol != baseUrl.protocol ||
        !Url.hostname ||
        Url.username ||
        Url.password
    ) Url = defaultUrl;
    return Url;
}

export function redirect(url: any, option: {base?: string | URL, default?: string} | string = {}) {
    const Url = safeUrl(url, option);
    nextRedirect(Url.pathname + Url.search, RedirectType.replace);
}

async function applyCommonMobileData(response: any, isGet: boolean = false) {
    if (isPlainObject(response)) {
        const {discount, items, ...cart} = (await getCart()) ?? {};
        response.session = {
            ...(await getSession()),
            ...cart,
            discountCode: typeof(discount) == 'string' ? discount : discount?.code,
            cart: items,
            ...getSessionMessage(),
        };
        response.config = config;
        if (isGet) {
            if (typeof(response.title) == 'undefined') response.title = title;
        }
    }
}

export function createGetHandler<P extends GetParam, S extends GetParam, R>(handler: GetHandler<P, S, R>): GetRouteHandler<P, S, R> {
    type _R = R extends Promise<any> ? Awaited<R> : R;
    async function getData(
        {
            params = {} as P,
            searchParams = {} as S,
            redirect: _redirect = redirect,
            isFromMobile = false,
        }: HandlerParams<P, S>
    ): Promise<_R> {
        normalizeParamValue(params);
        normalizeParamValue(searchParams);
        let response = handler({params, searchParams, redirect: _redirect, isFromMobile});
        if (response instanceof Promise) response = await response;
        if (isFromMobile) await applyCommonMobileData(response, true);
        return response as _R;
    }

    async function GET(
        request: NextRequest,
        {params}: {params?: P}
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

        const _redirect = (sUrl: string, defaultUrl?: string) => {
            return Response.redirect(safeUrl(sUrl, {base: request.url, default: defaultUrl}));
        };
        
        const isFromMobile = request.headers.get('X-Requested-With') == 'expressCartMobile';
        
        const data = await getData({
            params: (params || {}) as P,
            searchParams: searchParams as S,
            redirect: _redirect,
            isFromMobile
        });
        if (data instanceof Response) return data;
        return Response.json(data);
    }
    GET.data = getData;
    
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
        
        const _redirect = (sUrl: string, defaultUrl?: string) => {
            return Response.redirect(safeUrl(sUrl, {base: request.url, default: defaultUrl}));
        };
        const isFromMobile = request.headers.get('X-Requested-With') == 'expressCartMobile';
        return await submit(formData, _redirect, isFromMobile);
    }
    POST.response = submit;
    POST.responseJson = async <T>(formData: FormData) => {
        const response = await submit(formData);
        return (await response.json()) as T;
    };

    return POST;
}