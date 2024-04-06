/** 
 * https://github.com/atmulyana/nextCart
 **/
import {createPostHandler} from '@/lib/routeHandler';
import {clearUserSession} from '@/data/session';

export const POST = createPostHandler(async (formData, redirect) => {
    await clearUserSession();
    return redirect(formData.get('referrerUrl'), '/admin');
});