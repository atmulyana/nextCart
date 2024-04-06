/** 
 * https://github.com/atmulyana/nextCart
 **/
import lang from '@/data/lang';
import {dbTrans} from '@/data/db-conn';
import {deleteCart} from '@/data/cart';
import {getSession} from '@/data/session';
import {ResponseMessage} from '@/lib/common';
import {createPostHandler} from '@/lib/routeHandler';

export const POST = createPostHandler(async (formData, redirect, isFromMobile) => {
    return await dbTrans(async () => {
        const session = await getSession();
        const cartId = session.customerId || session._id;
        await deleteCart(cartId);
        return ResponseMessage(
            lang('Cart successfully emptied'),
            {
                status: 200,
                messageType: 'success',
                totalCartItems: 0,
                cart: null,
            }
        );
    });
});