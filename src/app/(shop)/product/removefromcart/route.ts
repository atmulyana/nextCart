/** 
 * https://github.com/atmulyana/nextCart
 **/
import type {TCart} from '@/data/types';
import lang from '@/data/lang/server';
import {type ObjectId} from '@/data/db-conn';
import {cartTrans, getCart, deleteCart, deleteCartItem, upsertCart} from '@/data/cart';
import {getSession} from '@/data/session';
import {updateTotalCart} from '@/lib/cart';
import {ResponseMessage} from '@/lib/common';
import {createPostHandler} from '@/lib/routeHandler';

export const POST = createPostHandler(async (formData) => {
    return await cartTrans(async () => {
        const cartWithId = await getCart();
        const session = await getSession();
        let cartId: ObjectId | undefined, cart: TCart | undefined;
        if (cartWithId) {
            ({_id: cartId, ...cart} = cartWithId);
        }

        const response = (message: string, status: number = 400, isEmpty: boolean = false) => ResponseMessage(
            message,
            {
                status,
                cart: isEmpty ? null : (cart ?? null),
                totalCartItems: cart?.totalCartItems ?? 0
            }
        );
        
        const cartItemId = formData.getString('cartId');
        // Check for item in cart
        if (!cartId || !cart || !cart.items || !cart.items[cartItemId]) {
            return response(lang('Product not found in cart'));
        }

        // remove item from cart
        delete cart.items[cartItemId];
        await deleteCartItem(cartId, cartItemId);
        await updateTotalCart(cart, session);
        
        // If no item in cart, discard cart
        if (Object.keys(cart.items).length < 1) {
            await deleteCart(cartId);
            return response(lang('Cart successfully emptied'), 200, true);
        }
        
        await upsertCart(cartId, cart);
        return response(lang('Product successfully removed'), 200);
    },
    formData.has('homeAfterClear'));
});