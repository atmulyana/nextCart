/** 
 * https://github.com/atmulyana/nextCart
 **/
import {createPostHandler} from '@/lib/routeHandler';
import {clearCustomerSession} from '@/data/session';

export const POST = createPostHandler(async (formData, redirect) => {
    await clearCustomerSession();
    return redirect(formData.get('referrerUrl'), '/customer/login');
});