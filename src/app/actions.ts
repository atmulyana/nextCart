'use server';
/** 
 * https://github.com/atmulyana/nextCart
 **/
import {redirect} from 'next/navigation';
import lang from '@/data/lang';
import {POST as logoutCustomerAction} from './(shop)/customer/logout/route';
import {POST as addCartItemAction} from './(shop)/product/addtocart/route';
import {POST as deleteCartItemAction} from './(shop)/product/removefromcart/route';
import {POST as updateCartItemAction} from './(shop)/product/updatecart/route';
import {POST as clearCartAction} from './(shop)/product/emptycart/route';
import {POST as addReviewAction} from './(shop)/product/addreview/route';

export async function initActions() {
    //There is a bug when using a server action which imports a module containing top level `await`
    //See: https://github.com/vercel/next.js/issues/54282
}

export async function logoutCustomer(formData: FormData) {
    await logoutCustomerAction.response(formData);
}

export async function addCartItem(formData: FormData) {
    if (formData.has('link')) {
        const link = formData.getString('link');
        if (link) return redirect(`/product/${encodeURIComponent(link)}`);
    }
    return await addCartItemAction.responseJson(formData);
}

export async function updateCartItem(formData: FormData) {
    const action = formData.getString('__action__');
    if (action == 'delete') {
        return await deleteCartItemAction.responseJson(formData);
    }
    else {
        let quantity = formData.getNumber('quantity');
        if (action == 'increase') quantity++;       //if (isNaN(q)) then q++ and q-- will also be NaN (considered as 1)
        else if (action == 'decrease') quantity--;
        formData.set('quantity', quantity+'');
        return await updateCartItemAction.responseJson(formData);
    }
}

export async function clearCart(formData: FormData) {
    return await clearCartAction.responseJson(formData);
}

export async function addReview(formData: FormData) {
    return await addReviewAction.responseJson(formData);
}

export async function getErrorPageTexts() {
    return [
        lang("Server can't process your request"),
        lang("Reload"),
    ];
}