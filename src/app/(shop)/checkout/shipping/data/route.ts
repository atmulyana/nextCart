/** 
 * https://github.com/atmulyana/nextCart
 **/
import {createGetHandler} from '@/lib/routeHandler';
import {generateMetadata, updateShippingInCart} from '../page';

export const GET = createGetHandler(async () => {
    return {
        cart: updateShippingInCart(),
        title: generateMetadata().title,
    };
});