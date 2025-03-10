/** 
 * https://github.com/atmulyana/nextCart
 **/
import lang from '@/data/lang';
import {cartTrans, deleteCart} from '@/data/cart';
import {getSession} from '@/data/session';
import {ResponseMessage} from '@/lib/common';
import {createPostHandler} from '@/lib/routeHandler';

export const POST = createPostHandler(async (formData) => {
    return await cartTrans(async () => {
        const session = await getSession();
        const cartId = session._id;
        await deleteCart(cartId);
        return ResponseMessage(
            lang('Cart successfully emptied'),
            {
                status: 200,
                cart: null,
            }
        );
    },
    formData.has('homeAfterClear'));
});