/** 
 * https://github.com/atmulyana/nextCart
 **/
import type {NotificationParam} from '@/components/Notification';
import type {TCart} from '@/data/types';
import lang from '@/data/lang';
import {dbTrans, type ObjectId} from '@/data/db-conn';
import {getCart, deleteCart, deleteCartItem, upsertCart} from '@/data/cart';
import {getSession} from '@/data/session';
import {updateTotalCart} from '@/lib/cart';
import {ResponseMessage} from '@/lib/common';
import {createPostHandler} from '@/lib/routeHandler';

export const POST = createPostHandler(async (formData, redirect, isFromMobile) => {
    return await dbTrans(async () => {
        const cartWithId = await getCart();
        const session = await getSession();
        let cartId: ObjectId | undefined, cart: TCart | undefined;
        if (cartWithId) {
            ({_id: cartId, ...cart} = cartWithId);
        }
        if (!cartId) return; //impossible
       
        const response = (message: string, {
            status = 400,
            totalCartItems = cart?.totalCartItems ?? 0,
            cart: _cart = cart,
            messageType = 'danger',
        }: {
            status?: number,
            totalCartItems?: number,
            cart?: TCart,
            messageType?: NotificationParam['type'],
        } = {}) => ResponseMessage(
            message,
            {
                status,
                totalCartItems,
                cart: isFromMobile ? null : _cart,
                messageType
            }
        );
        
        const cartItemId = formData.getString('cartId');
        // Check for item in cart
        if (!cart || !cart.items || !cart.items[cartItemId]) {
            return response(lang('Product not found in cart'));
        }

        // remove item from cart
        delete cart.items[cartItemId];
        await deleteCartItem(cartId, cartItemId);
        updateTotalCart(cart, session);
        
        // If no item in cart, discard cart
        if (Object.keys(cart.items).length < 1) {
            await deleteCart(cartId);
            return response(lang('Cart successfully emptied'), {status: 200, messageType: 'success'});
        }
        
        await upsertCart(cartId, cart);
        return response('', {status: 200});
    });
});