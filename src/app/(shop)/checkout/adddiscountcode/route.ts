/** 
 * https://github.com/atmulyana/nextCart
 **/
import lang from '@/data/lang';
import {getCart, upsertCart} from '@/data/cart';
import {getDiscountByCode} from '@/data/discount';
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
    
    const code = formData.getString('discountCode');
    
    // Check if the discount module is loaded
    if(!modules.discount){
        return response(lang('Access denied'), 403);
    }

    if (typeof(code) != 'string' || !code) {
        return response(lang('Discount code is required'));
    }

    const discount = await getDiscountByCode(code);
    if(!discount){
        return response(lang('Discount code is not found'), 404);
    }

    const now = Date.now();
    if (now > discount.end.getTime()) {
        return response(lang('Discount code is expired'), 410);
    }
    if (now < discount.start.getTime()) {
        return response(lang('Discount code does not apply yet'), 451);
    }

    const session = await getSession();
    cart.discount = code;
    await updateTotalCart(cart, session);
    await upsertCart(cart._id, cart);

    return response(lang('Discount code applied'), 200);
});