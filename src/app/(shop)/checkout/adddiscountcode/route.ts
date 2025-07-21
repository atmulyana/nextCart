/** 
 * https://github.com/atmulyana/nextCart
 **/
import lang from '@/data/lang/server';
import {getCart, upsertCart} from '@/data/cart';
import type {TDiscount} from '@/data/types';
import {getSession} from '@/data/session';
import {updateTotalCart} from '@/lib/cart';
import {ResponseMessage} from '@/lib/common';
import modules from '@/lib/modules';
import {createPostHandler} from '@/lib/routeHandler';

export const POST = createPostHandler(async (formData) => {
    const cart = await getCart();
    const response = (message: string, status: number = 400) => ResponseMessage(
        message, {
            status,
            cart: cart ?? null,
        }
    );

    if (!cart) return response(lang('There are no items in your cart'));
    
    // Check if the discount module is loaded
    if(!modules.discount){
        return response(lang('Access denied'), 403);
    }

    const discount = formData.get<TDiscount>('discountCode');
    
    const session = await getSession();
    cart.discount = discount.code;
    await updateTotalCart(cart, session);
    await upsertCart(cart._id, cart);

    return response(lang('Discount code applied'), 200);
});