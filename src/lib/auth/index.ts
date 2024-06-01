/** 
 * https://github.com/atmulyana/nextCart
 **/
import NextAuth from "next-auth";
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