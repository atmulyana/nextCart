/** 
 * https://github.com/atmulyana/nextCart
 **/
import type {Session} from "next-auth";

type Redirect = {
    path: string,
    message?: string,
    messageType?: Session['messageType'],
};

type ToRedirectItem = {
    fromPath: string,
    isPrefix?: boolean,
    toPath: string | ((auth: Session | null) => string | null | undefined),
    message?: string,
    messageType?: Session['messageType'],
}

function customerNeedsLogin(auth: Session | null) {
    if (!auth?.customerPresent) return '/customer/login';
}

function customerHasLoggedIn(auth: Session | null) {
    if (auth?.customerPresent) return '/customer/account';
}

function adminNeedsLogin(auth: Session | null) {
    if (!auth?.user) return '/admin/login';
}

function adminHasLoggedin(auth: Session | null) {
    if (auth?.user) return '/admin';
}

const items: ToRedirectItem[] = [
    {
        fromPath: '/customer/account',
        toPath: customerNeedsLogin
    },
    {
        fromPath: '/customer/logout',
        toPath: customerNeedsLogin
    },
    {
        fromPath: '/customer/login',
        toPath: customerHasLoggedIn
    },
    {
        fromPath: '/customer/login_action',
        toPath: customerHasLoggedIn
    },
    {
        fromPath: '/admin/login',
        toPath: adminHasLoggedin
    },
    {
        fromPath: '/admin/login_action',
        toPath: adminHasLoggedin
    },
    {
        fromPath: '/admin',
        isPrefix: true,
        toPath: adminNeedsLogin
    },
];

export function toRedirect(path: string, auth: Session | null) {
    for (const {fromPath, isPrefix, toPath, message, messageType} of items) {
        if (path == fromPath || isPrefix && path.startsWith(`${fromPath}/`)) {
            const redirectPath = typeof(toPath) == 'function' ? toPath(auth) : toPath;
            return redirectPath 
                ? {
                    path: redirectPath,
                    message,
                    messageType,
                }
                : null;
        }
    }
}