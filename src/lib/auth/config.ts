/** 
 * https://github.com/atmulyana/nextCart
 **/
import type {NextAuthConfig, Session} from "next-auth";
import {customAlphabet} from 'nanoid';
import appCfg from '@/config';

const BASE64_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
const nanoid = customAlphabet(BASE64_CHARS, 16);

export default {
    basePath: "/api/auth",
    providers: [],
    //debug: true,
    logger: {
        error(code, ...message) {
            console.error(code, ...message)
        },
        warn(code, ...message) {
            console.warn(code, ...message)
        },
        debug(code, ...message) {
            console.debug(code, ...message)
        }
    },
    cookies: {
        name: appCfg.session.paramName,
    },
    session: {
        strategy: 'jwt',
        maxAge: appCfg.session.maxAge ?? 30 * 24 * 60 * 60,
    },
    secret: 'abc',
    callbacks: {
        async jwt({token, trigger, session, user}) {
            if (trigger == 'signIn') {
                token = {
                    id: user.token?.id ?? '',
                };
                if (user.isCustomer) {
                    token.customer = {
                        id: user.id,
                        email: user.email,
                        chartItemCount: token.customer?.chartItemCount ?? 0,
                    };
                    token.user = user.token?.user;
                }
                else {
                    token.user = {
                        id: user.id as string,
                        isAdmin: !!user.isAdmin,
                        isOwner: !!user.isOwner,
                    };
                    token.customer = user.token?.customer;
                }
            }
            else if (trigger == 'update') {
                const {message, messageType, ...oldToken} = token;
                token = {
                    ...oldToken,
                    ...session,
                    customer: ('customer' in session) && !session.customer ? {
                        chartItemCount: token.customer?.chartItemCount,
                    } : {
                        ...token.customer,
                        ...session.customer,
                    },
                };
            }
            else if (trigger == 'signUp') {
                throw new Error('Not supported')
            }

            if (!token.id) token.id = nanoid(16);
            if (typeof(token.customer?.chartItemCount) != 'number') {
                token.customer = {
                    ...token.customer,
                    chartItemCount: 0,
                };
            }

            return token;
        },

        async session({token, session}) {
            const sess: Session = {
                id: token.id,
                user: token.user,
                customer: token.customer,
                get customerPresent() {
                    return !!this.customer?.email;
                },
                message: token.message,
                messageType: token.messageType,
                expires: session.expires,
            };

            // if (token.refresh) {
            //     sess.refresh = token.refresh;
            //     delete token.refresh;
            // }

            return sess;
        },
    },
} as NextAuthConfig;