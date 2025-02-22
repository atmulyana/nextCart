/** 
 * https://github.com/atmulyana/nextCart
 **/
import {headers} from 'next/headers';
import {NextRequest} from 'next/server';
import type {NotificationParam} from '@/subview/components/Notification';
import {getData, setData} from './intermittentData';

const paramName = {
    message: 'x-msg',
    messageType: 'x-msg-type',
    urlPath: 'x-request-path',
    urlQuery: 'x-request-query',
};

export function getUrl(request: NextRequest) {
    const url = request.nextUrl;
    request.headers.set(paramName.urlPath, url.pathname);
    request.headers.set(paramName.urlQuery, url.search);
    return url;
}

/**
 * It's used by middleware. Because of running on 'edge' runtime,
 * the message should be moved to the request header so that it
 * can be read by all routes
 */
export function fetchMessage(sessionId: string, request: Request) {
    const message = getData<string>(sessionId, paramName.message),
          messageType = getData<string>(sessionId, paramName.messageType);
    if (message) {
        request.headers.set(paramName.message, message)
    }
    else if (request.headers.has(paramName.message)) {
        request.headers.delete(paramName.message);
    }
    if (messageType) {
        request.headers.set(paramName.messageType, messageType)
    }
    else if (request.headers.has(paramName.messageType)) {
        request.headers.delete(paramName.messageType);
    }
}

export function setRedirectMessage(
    sessionId: string,
    message: NotificationParam | string,
    type?: NotificationParam['type'] | number,
    counter: number = 1
) {
    if (typeof(type) == 'number') {
        counter = type;
        type = void(0);
    }
    if (typeof(message) == 'string') {
        setData(sessionId, paramName.message, message, counter);
        if (type) setData(sessionId, paramName.messageType, type, counter);
    }
    else {
        setData(
            sessionId,
            {
                [paramName.message]: message.message,
                [paramName.messageType]: message.type,
            },
            null,
            counter
        )
    }
}

export async function getSessionMessage(request?: Request, sessionId?: string) {
    const hdrs = request?.headers ?? await headers();
    const msg: Partial<NotificationParam> = {};
    let val: string | null | undefined = hdrs.get(paramName.message);
    if (val) msg.message = val;
    if (sessionId) {
        val = getData(sessionId, paramName.message);
        if (val) msg.message = val;
    }
    val = hdrs.get(paramName.messageType);
    if (val) msg.type = val as NotificationParam['type'];
    if (sessionId) {
        val = getData(sessionId, paramName.messageType);
        if (val) msg.type = val as NotificationParam['type'];
    }
    return msg;
}

export async function getRequestUrl() {
    const hdrs = await headers();
    return {
        path: hdrs.get(paramName.urlPath) ?? '',
        search: hdrs.get(paramName.urlQuery) ?? '',
    }
}

export async function isFromMobile(hdrs?: Headers) {
    hdrs ??= await headers();
    return hdrs.get('X-Requested-With') == 'expressCartMobile';
}