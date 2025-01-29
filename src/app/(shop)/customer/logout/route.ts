/** 
 * https://github.com/atmulyana/nextCart
 **/
import {createPostHandler} from '@/lib/routeHandler';
import {clearCustomerSession} from '@/data/session';
import {updateSessionToken} from '@/lib/auth';

export const POST = createPostHandler(async (formData, redirect, isFromMobile) => {
    await updateSessionToken({customer: null});
    await clearCustomerSession();
    if (isFromMobile) return null;
    return redirect(formData.get('referrerUrl'), '/customer/login');
});