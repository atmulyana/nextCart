/** 
 * https://github.com/atmulyana/nextCart
 **/
import {NextRequest} from 'next/server';
import {createPostHandler} from '@/lib/routeHandler';
import {clearUserSession} from '@/data/session';
import {updateSessionToken} from '@/lib/auth';

export const POST = createPostHandler(async (formData, redirect) => {
    await updateSessionToken({user: null});
    await clearUserSession();
    return redirect(formData.getString('referrerUrl'), '/admin');
});

export async function GET(request: NextRequest, context: any) {
    return await POST(request, context);
}