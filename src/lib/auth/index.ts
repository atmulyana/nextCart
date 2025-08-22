/** 
 * https://github.com/atmulyana/nextCart
 **/
import {cache} from 'react';
import {revalidatePath} from 'next/cache';
import {cookies, headers} from 'next/headers';
import {redirect, RedirectType} from 'next/navigation';
import {getRedirectError} from 'next/dist/client/components/redirect';
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import {emptyString} from 'javascript-common';
import type {NotificationParam} from '@/components/Notification';
//import {refreshSessionExpires} from "@/data/session";
import config from './config';
import {getRequestUrl, getSessionMessage as internalGetSessionMessage, isFromMobile, setRedirectMessage} from './common';

export const {signIn, signOut, auth, handlers, unstable_update: updateSessionToken} = NextAuth({
    ...config,
    providers: [
        Credentials({
            id: 'customer',
            credentials: {
                customerId: { label: "ID",  },
                customerEmail: { label: "Email" },
            },
            async authorize({customerId, customerEmail}) {
                let session = await auth(),
                    id = customerId as (string | undefined),
                    email = customerEmail as (string | undefined);
                if (!id) {
                    if (email == session?.customer?.email) id = session?.customer?.id;
                }
                return {
                    id: id ?? emptyString, //empty string is to avoid creating a random ID
                    email,
                    isCustomer: true,
                    token: session,
                };
            },
        }),
        Credentials({
            id: 'admin',
            credentials: {
                userId: { label: "ID" },
                userAdmin: { label: "Is Admin" },
                userOwner: { label: "Is Owner" },
            },
            async authorize({userId, userAdmin, userOwner}) {
                let session = await auth(),
                    id = userId as string,
                    isAdmin = userAdmin == 'true',
                    isOwner = userOwner == 'true';
                return {
                    isCustomer: false,
                    id,
                    isAdmin,
                    isOwner,
                    token: session,
                };
            },
        }),
    ],

    // events: {
    //     async session({session}) {
    //         if (session.refresh == 'EXPIRES') {
    //             await refreshSessionExpires(new Date(session.expires), session.id);
    //         }
    //     }
    // },
});

//`cache` is not supported in middleware
export const getSessionToken = cache(auth);

export async function redirectWithMessage(
    url: string | URL /* including `NextURL` */,
    message: (NotificationParam | string) & {counter?: number},
    isRendering = false,
) {
    const session = await getSessionToken();
    if (!session) return void(0) as never;
    if (typeof(url) == 'object') url = url.pathname + url.search;
    else if (!url.startsWith('/')) throw "Invalid URL: only absolute path accepted without protocol and hostname.";
    const isServerAction = (await headers()).get('Next-Action');
    setRedirectMessage(session.id, message, message.counter);
    if (!isServerAction && !isRendering) revalidatePath(url);
    if (!isRendering) (await cookies()).set('x-revalidated-at', new Date().toISOString());
    if (await isFromMobile()) throw getRedirectError(url, RedirectType.replace, 303);
    return redirect(url, RedirectType.replace);
}

export async function getSessionMessage(request?: Request) {
    return await internalGetSessionMessage(request, (await getSessionToken())?.id);
}

export {getRequestUrl};