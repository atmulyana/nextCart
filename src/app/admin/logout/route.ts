/** 
 * https://github.com/atmulyana/nextCart
 **/
import {createPostHandler} from '@/lib/routeHandler';
import {clearUserSession} from '@/data/session';
import {updateSessionToken} from '@/lib/auth';

export const POST = createPostHandler(async (formData, redirect) => {
    await updateSessionToken({user: null});
    await clearUserSession();
    return redirect(formData.get('referrerUrl'), '/admin');
});