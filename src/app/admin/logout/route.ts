/** 
 * https://github.com/atmulyana/nextCart
 **/
import {createPostHandler} from '@/lib/routeHandler';
import {clearUserSession} from '@/data/session';
import {updateSession} from '@/lib/auth';

export const POST = createPostHandler(async (formData, redirect) => {
    await updateSession({user: null});
    await clearUserSession();
    return redirect(formData.get('referrerUrl'), '/admin');
});