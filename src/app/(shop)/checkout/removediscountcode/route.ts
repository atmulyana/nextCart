/** 
 * https://github.com/atmulyana/nextCart
 **/
import lang from '@/data/lang';
import {getCart, upsertCart} from '@/data/cart';
import {getSession} from '@/data/session';
import {updateTotalCart} from '@/lib/cart';
import {ResponseMessage} from '@/lib/common';
import {createPostHandler} from '@/lib/routeHandler';

export const POST = createPostHandler(async () => {
    const cart = await getCart();
    if (!cart) return ResponseMessage(lang('There are no items in your cart'), {status: 400, cart: null});
    const session = await getSession();
    delete cart.discount;
    await updateTotalCart(cart, session);
    await upsertCart(cart._id, cart);

    return ResponseMessage(lang('Discount code removed'), {status: 200,  cart});
});