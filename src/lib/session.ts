/** 
 * https://github.com/atmulyana/nextCart
 **/
import type {NextRequest} from "next/server";
import allConfig from '@/config';
import {createSessionId} from "./data-id";
const {session: config} = allConfig;
export {config};

export function renewSessionCookie(request: NextRequest) {
    let sessionId = request.cookies.get(config.paramName)?.value;
    if (!sessionId) sessionId = createSessionId();
    const cookieOpts = {
        name: config.paramName,
        value: sessionId,
        maxAge: config.maxAge || undefined,
        httpOnly: true,
        path: '/',
    };
    request.cookies.set(cookieOpts);
    return cookieOpts;
}