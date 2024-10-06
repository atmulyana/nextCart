/** 
 * https://github.com/atmulyana/nextCart
 **/
import {getCart, upsertCart} from '@/data/cart';
import {getSession} from '@/data/session';
import {updateTotalCart} from '@/lib/cart';

export async function updateShippingInCart() {
    const cart = await getCart();
    const session = await getSession();
    if (cart) {
        await updateTotalCart(cart, session);
        await upsertCart(cart._id, cart);
    }
    return cart;
}