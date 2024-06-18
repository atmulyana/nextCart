/** 
 * https://github.com/atmulyana/nextCart
 **/
import {NextRequest, NextResponse} from "next/server";
import {headers as nextHeaders} from "next/headers";
import {Auth, raw, skipCSRFCheck, createActionURL} from "@auth/core";
import type {ResponseInternal} from '@auth/core/types';
import NextAuth, {type Session} from "next-auth";
import Credentials from "next-auth/providers/credentials";
import cfg from './config';
import {toRedirect} from "./access";

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
    const req = new Request(url, {
        method: "POST",
        headers,
        body
    });
    const resp = await Auth(req, {
        ...config,
        raw,
        skipCSRFCheck,
        trustHost: true
    });
    return resp?.cookies;
}

async function updateSession(data: Partial<Session>, request: NextRequest) {
    const headers = new Headers(nextHeaders());
    headers.set("Content-Type", "application/json");
    const url = createActionURL(
        "session", 
        // @ts-expect-error `x-forwarded-proto` is not nullable, next.js sets it by default
        headers.get("x-forwarded-proto"),
        headers, process.env,
        config.basePath
    );
    const body = JSON.stringify({data});
    const req = new Request(url, {
        method: "POST",
        headers,
        body
    });
    const res = await Auth(req, {
        ...config,
        raw,
        skipCSRFCheck
    });
    setRequestCookies(request, res?.cookies);
    return res?.cookies;
}

export const middleware = auth(async (request) => {
    let auth = request.auth;
    let cookies: Cookies;
    console.log('> auth: ', auth)
    if (!auth) {
        cookies = await initSession();
        setRequestCookies(request, cookies);
    }
    
    let url = request.url.replace(/\/+$/, '');
    const Url = new URL(url);
    request.headers.set('x-request-path', Url.pathname);
    request.headers.set('x-request-query', Url.search);

    let redirect = toRedirect(Url.pathname, auth);
    if (redirect) {
        const message = redirect?.message?.trim();
        if (message) {
            delete auth?.messageFlag;
            cookies = await updateSession({...auth, message, messageType: redirect.messageType}, request);
        }
        const response = NextResponse.redirect(new URL(redirect.path, url));
        setResponseCookies(response, cookies);
        return response;
    }
    
    if (request.headers.get('X-Requested-With') == 'expressCartMobile' && request.method == 'GET' && !url.endsWith('/data'))
        url += '/data';
    
    const {message, messageFlag, messageType, ...session} = auth ?? {};
    if (message?.trim()) {
        if (messageFlag) {
            cookies = await updateSession(session, request);
        }
        else {
            cookies = await updateSession({...session, message, messageType, messageFlag: true}, request);
        }
    }

    const response = NextResponse.rewrite(url, {request});
    setResponseCookies(response, cookies);
    return response;
});