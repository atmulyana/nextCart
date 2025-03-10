/** 
 * https://github.com/atmulyana/nextCart
 **/
import type {TCartItem} from '@/data/types';
import lang from '@/data/lang';
import {cartTrans, deleteCart, deleteCartItem, getCart, upsertCart, upsertCartItem} from '@/data/cart';
import {getSession} from '@/data/session';
import {checkStock, updateTotalCart} from '@/lib/cart';
import {ResponseMessage} from '@/lib/common';
import {createPostHandler} from '@/lib/routeHandler';

export const POST = createPostHandler(async (formData) => {
    return await cartTrans(async () => {
        const cartWithId = await getCart();
        if (!cartWithId) {
            return ResponseMessage(
                lang('There are no items if your cart or your cart is expired'),
                {
                    status: 410,
                    totalCartItems: 0,
                    cart: null,
                }
            );
        }
        const {_id: cartId, ...cart} = cartWithId;

        const cartItemId = formData.getString('cartId');
        let quantity = formData.getNumber('quantity');
        if (isNaN(quantity)) quantity = 1;
        else if (quantity > 0) quantity = Math.floor(quantity);
        const productComment = formData.getString('productComment');
        let oriCartItem: TCartItem | undefined;
        
        const response = (message: string, status = 400) => {
            if ((status < 200 || 299 < status) && oriCartItem && cartItemId) {
                cart.items[cartItemId] = oriCartItem;
            } 
            return ResponseMessage(
                message,
                {
                    status,
                    cart: Object.keys(cart.items).length < 1 ? null : cart,
                }
            );
        }
        
        const cartItem = cart.items[cartItemId];
        if (!cartItem) {
            return response(lang('There was an error updating the cart'), 404);
        }
        oriCartItem = {...cartItem};
        
        const session = await getSession();
        if (
            typeof(cartItem.title) == 'undefined' //The product has been deleted
            || quantity < 1
        ) { 
            delete cart.items[cartItemId];
            await updateTotalCart(cart, session);
            await deleteCartItem(cartId, cartItemId);
            if (Object.keys(cart.items).length < 1) {
                await deleteCart(cartId);
            }
            else {
                await upsertCart(cartId, cart);
            }
            return typeof(cartItem.title) == 'undefined'
                ? response(lang('The product has been deleted'), 410)
                : response('', 200);
        }

        quantity = Math.floor(quantity);
        const itemPrice = cartItem.totalItemPrice / cartItem.quantity;
        cartItem.quantity = quantity;
        cartItem.totalItemPrice = quantity * itemPrice;
        cartItem.productComment = productComment;
        
        const check = checkStock(cartItem);
        if (check) {
            if (check.constraint < 1) return response(lang(check.message));
            cartItem.quantity = check.constraint;
        }

        await updateTotalCart(cart, session);
        await upsertCart(cartId, cart);
        await upsertCartItem(cartId, cartItemId, cartItem);
        return check
            ? response(lang(check.message), 201)
            : response('', 200);
    },
    formData.has('homeAfterClear'));
});