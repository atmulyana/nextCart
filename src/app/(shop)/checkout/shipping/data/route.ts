/** 
 * https://github.com/atmulyana/nextCart
 **/
import {createGetHandler} from '@/lib/routeHandler';
import {updateShippingInCart} from '../cart';
import {generateMetadata} from '../page';

export const GET = createGetHandler(async () => {
    return {
        cart: await updateShippingInCart(),
        cartReadOnly: true,
        title: generateMetadata().title,
    };
});