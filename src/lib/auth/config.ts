/** 
 * https://github.com/atmulyana/nextCart
 **/
import type {NextAuthConfig, Session} from "next-auth";
import {customAlphabet} from 'nanoid';
import clientCfg from '@/config/usable-on-client';
import sessionCfg from '@/config/session';

process.env.AUTH_TRUST_HOST = clientCfg.baseUrl.host;

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
        sessionToken: {
            name: sessionCfg.paramName,
            options: {
                httpOnly: true,
                sameSite: 'lax',
                path: clientCfg.baseUrl.pathname,
                secure: process.env.AUTH_SECURE,
            }
        },
        // callbackUrl: {
        //     name: `${sessionCfg.paramName}.callback`,
        //     options: {
        //         sameSite: 'lax',
        //         path: clientCfg.baseUrl.pathname,
        //         secure: process.env.AUTH_SECURE
        //     }
        // },
        // csrfToken: {
        //     name: `${sessionCfg.paramName}.csrf`,
        //     options: {
        //         httpOnly: true,
        //         sameSite: 'lax',
        //         path: clientCfg.baseUrl.pathname,
        //         secure: process.env.AUTH_SECURE
        //     }
        // },
        // pkceCodeVerifier: {
        //     name: `${sessionCfg.paramName}.pkce`,
        //     options: {
        //         httpOnly: true,
        //         sameSite: 'lax',
        //         path: clientCfg.baseUrl.pathname,
        //         secure: process.env.AUTH_SECURE,
        //         maxAge: 900
        //     }
        // },
        // state: {
        //     name: `${sessionCfg.paramName}.state`,
        //     options: {
        //         httpOnly: true,
        //         sameSite: "lax",
        //         path: clientCfg.baseUrl.pathname,
        //         secure: process.env.AUTH_SECURE,
        //         maxAge: 900
        //     },
        // },
        // nonce: {
        //     name: `${sessionCfg.paramName}.nonce`,
        //     options: {
        //         httpOnly: true,
        //         sameSite: "lax",
        //         path: clientCfg.baseUrl.pathname,
        //         secure: process.env.AUTH_SECURE,
        //     },
        // },
    },
    session: {
        strategy: 'jwt',
        maxAge: !sessionCfg.maxAge || sessionCfg.maxAge < 1 ? 30 * 24 * 60 * 60 : sessionCfg.maxAge,
    },
    secret: sessionCfg.secret,
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
                        chartItemCount: user.token?.customer?.chartItemCount ?? 0,
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
                //eslint-disable-next-line @typescript-eslint/no-unused-vars
                const {message, messageType, ...oldToken} = token;
                token = {
                    ...oldToken,
                    ...session,
                    customer: ('customer' in session) && !session.customer ? {
                        chartItemCount: oldToken.customer?.chartItemCount,
                    } : {
                        ...oldToken.customer,
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