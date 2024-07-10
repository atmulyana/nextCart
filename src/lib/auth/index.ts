/** 
 * https://github.com/atmulyana/nextCart
 **/
import {cookies} from 'next/headers';
import {redirect} from 'next/navigation';
import {NextRequest, NextResponse} from "next/server";
import NextAuth, {type Session} from "next-auth";
import Credentials from "next-auth/providers/credentials";
//import {refreshSessionExpires} from "@/data/session";
import config from './config';

export const {signIn, signOut, auth, handlers, unstable_update: updateSession} = NextAuth({
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
                    id: id ?? '', //empty string is to avoid creating a random ID
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
                    isAdmin = userAdmin as (boolean | undefined),
                    isOwner = userOwner as (boolean | undefined);
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

type RequestCookies = Pick<NextRequest['cookies'], 'get' | 'has'>;
type ResponseCookies = Pick<NextResponse['cookies'], 'set'>;

const cookieName = {
    message: 'sess-msg',
    messageType: 'sess-msg-type',
}

export function setSessionMessage(message: string | undefined, messageType?: Session['messageType'], response?: NextResponse) {
    const cakes: ResponseCookies = response ? response.cookies : cookies();
    message = message?.trim();
    if (message) {
        cakes.set(cookieName.message, message);
        if (messageType) cakes.set(cookieName.messageType, messageType);
    }
}

export function getSessionMessage(request?: NextRequest) {
    const cakes: RequestCookies = request ? request.cookies : cookies();
    const data: Pick<Session, 'message' | 'messageType'> = {};
    if (cakes.has(cookieName.message)) {
        data.message = cakes.get(cookieName.message)?.value.trim();
        if (request) request.cookies.delete(cookieName.message);
    }
    if (cakes.has(cookieName.messageType)) {
        data.messageType = cakes.get(cookieName.messageType)?.value.trim() as Session['messageType'];
        if (request) request.cookies.delete(cookieName.messageType);
    }
    return data;
}

export function clearSessionMessage(response?: NextResponse) {
    const cakes: ResponseCookies = response ? response.cookies : cookies();
    cakes.set(cookieName.message, '', {maxAge: 0});
    cakes.set(cookieName.messageType, '', {maxAge: 0});
}