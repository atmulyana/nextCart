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
    fromPath: string | Array<string>,
    isPrefix?: boolean,
    toRedirect?: string | null | ((auth: Session | null) => Redirect | string | null | undefined),
    message?: string,
    messageType?: Session['messageType'],
}

function checkoutEmptyCart(auth: Session | null) {
    if ((auth?.customer?.chartItemCount ?? 0) < 1) return {
        path: '/',
        message: 'The are no items in your cart. Please add some items before checking out.'
    }
}

function checkoutCustomerMustExist(auth: Session | null) {
    if (!auth?.customerPresent) return {
        path: '/checkout/information',
        message: 'Please fill the customer information for shipping'
    }
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
        fromPath: ['/checkout/cart', '/checkout/information'],
        toRedirect: checkoutEmptyCart,
    },
    {
        fromPath: ['/checkout/shipping', '/checkout/payment'],
        toRedirect: (auth: Session | null) => checkoutEmptyCart(auth) || checkoutCustomerMustExist(auth),
    },
    {
        fromPath: '/customer/account',
        toRedirect: customerNeedsLogin
    },
    {
        fromPath: '/customer/logout',
        toRedirect: customerNeedsLogin
    },
    {
        fromPath: '/customer/login',
        toRedirect: customerHasLoggedIn
    },
    {
        fromPath: '/customer/login_action',
        toRedirect: customerHasLoggedIn
    },
    {
        fromPath: '/admin/login',
        toRedirect: adminHasLoggedin
    },
    {
        fromPath: '/admin/login_action',
        toRedirect: adminHasLoggedin
    },
    {
        fromPath: '/admin',
        isPrefix: true,
        toRedirect: adminNeedsLogin
    },
];

export function toRedirect(path: string, auth: Session | null) {
    for (const {fromPath, isPrefix, toRedirect: toPath, message, messageType} of items) {
        if (
            Array.isArray(fromPath) && fromPath.includes(path) ||
            path === fromPath ||
            !Array.isArray(fromPath) && isPrefix && path.startsWith(`${fromPath}/`)
        ) {
            let redirect = typeof(toPath) == 'function' ? toPath(auth) : toPath;
            if (typeof(redirect) == 'string') redirect = {path: redirect};
            return redirect
                ? {
                    message,
                    messageType,
                    ...redirect,
                }
                : null;
        }
    }
}