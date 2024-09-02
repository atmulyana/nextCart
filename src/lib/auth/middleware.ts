/** 
 * https://github.com/atmulyana/nextCart
 **/
import {NextRequest, NextResponse} from "next/server";
import {headers as nextHeaders} from "next/headers";
import {Auth, raw, skipCSRFCheck, createActionURL} from "@auth/core";
import type {ResponseInternal} from '@auth/core/types';
import NextAuth, {type Session} from "next-auth";
import Credentials from "next-auth/providers/credentials";
import {newUrl} from '@/lib/payments/routes';
import cfg from './config';
import {toRedirect} from "./access";
import {fetchMessage, getUrl, setRedirectMessage} from "./common";

type Cookies = ResponseInternal['cookies'];


let jwtCreated: ((token: Session) => void) | undefined;
const config: typeof cfg = {
    ...cfg,
    callbacks: {
        ...cfg.callbacks,
        async jwt(params) {
            const token = (cfg.callbacks?.jwt && await cfg.callbacks.jwt(params)) ?? null;
            if (typeof(jwtCreated) == 'function') jwtCreated(
                {
                    id: token?.id ?? '',
                    customer: token?.customer,
                    customerPresent: false,
                    expires: new Date().toISOString(),
                }
            );
            return token;
        },
    },
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
    return resp.cookies;
}

export const middleware = auth(async (request) => {
    let auth!: Session;
    let cookies: Cookies;
    if (request.auth) {
        auth = request.auth;
    }
    else {
        jwtCreated = (sess) => {
            auth = sess;
        }
        cookies = await initSession();;
        setRequestCookies(request, cookies);
        jwtCreated = void(0);
    }

    const url = getUrl(request);
    fetchMessage(auth.id, request);
    const paymentUrl = await newUrl(request);
    
    const redirect = toRedirect(
        paymentUrl ? '/checkout/payment' : url.pathname,
        auth
    );
    if (redirect) {
        const message = redirect.message?.trim(),
              redirectUrl = new URL(redirect.path, url);
        let response: NextResponse;
        if (message)  setRedirectMessage(auth.id, message, redirect.messageType)
        response = NextResponse.redirect(redirectUrl);
        setResponseCookies(response, cookies);
        return response;
    }
    
    if (paymentUrl) {
        url.pathname = paymentUrl;
    }
    else if (request.headers.get('X-Requested-With') == 'expressCartMobile' && request.method == 'GET' && !url.pathname.endsWith('/data')) {
        url.pathname += '/data';
    }
    const response = NextResponse.rewrite(url.toString(), {request});
    setResponseCookies(response, cookies);
    return response;
});