/** 
 * https://github.com/atmulyana/nextCart
 **/
import {createPostHandler} from '@/lib/routeHandler';
import {clearCustomerSession} from '@/data/session';
import {updateSession} from '@/lib/auth';

export const POST = createPostHandler(async (formData, redirect) => {
    await updateSession({customer: null});
    await clearCustomerSession();
    return redirect(formData.get('referrerUrl'), '/customer/login');
});