/** 
 * https://github.com/atmulyana/nextCart
 **/
import {createGetHandler} from '@/lib/routeHandler';
export const GET = createGetHandler(async () => {
    //This interface is typically used by expressCartMobile to get the cart data.
    //The cart data, however, is set automatically by `createGetHandler` as a the part
    //of session data.
    return {};
});