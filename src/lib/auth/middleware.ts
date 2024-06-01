/** 
 * https://github.com/atmulyana/nextCart
 **/
import {NextRequest, NextResponse} from "next/server";
import {headers as nextHeaders} from "next/headers";
import {Auth, raw, skipCSRFCheck, createActionURL} from "@auth/core";
import type {ResponseInternal} from '@auth/core/types';
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import cfg from './config';

type Cookies = ResponseInternal['cookies'];

const config = {
    ...cfg,
    providers: [
        Credentials({
            id: 'guest',
            async authorize() {
                return {
                    id: '',
                    isCustomer: true,
                };
            },
        }),
    ],
};

const {auth} = NextAuth(config);


function setRequestCookies(request: NextRequest, cookies: Cookies) {
    for (const c of (cookies ?? [])) {
        request.cookies.set(c.name, c.value);
    }
}

function setResponseCookies(response: NextResponse, cookies: Cookies) {
    for (const c of (cookies ?? [])) {
        response.cookies.set(c.name, c.value, c.options);
    }
}

async function initSession() {
    const headers = new Headers(nextHeaders());
    let url = createActionURL(
        "callback",
        // @ts-expect-error `x-forwarded-proto` is not nullable, next.js sets it by default
        headers.get("x-forwarded-proto"),
        headers,
        process.env,
        config.basePath
    );
    url.pathname += '/guest';

    headers.set("Content-Type", "application/x-www-form-urlencoded");
    const body = null;
    const req = new Request(url, { method: "POST", headers, body });
    const resp = await Auth(req, {
        ...config,
        raw,
        skipCSRFCheck,
        trustHost: true
    });
    return resp?.cookies;
}

export const middleware = auth(async (request) => {
    let cookies: Cookies;
    if (!request.auth) {
        cookies = await initSession();
        setRequestCookies(request, cookies);
    }
    
    let url = request.url.replace(/\/+$/, '');
    const Url = new URL(url);
    request.headers.set('x-request-path', Url.pathname);
    request.headers.set('x-request-query', Url.search);

    let redirectUrl = '';
    if (Url.pathname == '/customer/account' || Url.pathname == '/customer/logout') {
        if (!request.auth?.customerPresent) redirectUrl = '/customer/login';
    }
    else if (Url.pathname == '/customer/login' || Url.pathname == '/customer/login_action') {
        if (request.auth?.customerPresent) redirectUrl = '/customer/account';
    }
    else if (Url.pathname == '/admin/login' || Url.pathname == '/admin/login_action') {
        if (request.auth?.user) redirectUrl = '/admin';
    }
    else if (Url.pathname.startsWith('/admin')) {
        if (!request.auth?.user) redirectUrl = '/admin/login';
    }

    if (redirectUrl) {
        const response = NextResponse.redirect(new URL(redirectUrl, url));
        setResponseCookies(response, cookies);
        return response;
    }
    
    if (request.headers.get('X-Requested-With') == 'expressCartMobile' && request.method == 'GET' && !url.endsWith('/data'))
        url += '/data';
    
    const response = NextResponse.rewrite(url, {request});
    setResponseCookies(response, cookies);
    return response;
});