/** 
 * https://github.com/atmulyana/nextCart
 **/
import {notFound} from 'next/navigation';
import {emptyString} from 'javascript-common';
import {getCart} from '@/data/cart';
import {getSession} from '@/data/session';
import {getSessionToken, updateSessionToken} from '@/lib/auth';
import {isIndexNumber} from '@/lib/common';

export async function GET(
    _: Request,
    {params}: {params: Promise<{nums: string[]}>}
) {
    /*** Just a little bit obfuscating ***/
    const {nums} = await params;
    if (!nums || nums.length != 3) return notFound();
    for (let num of nums) if (!isIndexNumber(num)) return notFound();
    if (parseInt(nums[0]) != 3 * parseInt(nums[1]) || parseInt(nums[1]) != 3 * parseInt(nums[2])) return notFound();
    
    const token = await getSessionToken();
    if (!token) return null;
    const cart = await getCart();
    const session = await getSession();
    token.customerPresent = !!session.customerId || !!session.customerEmail;
    token.customer = {
        chartItemCount: cart?.totalCartItems ?? 0,
        id: session.customerId?.toString() ?? emptyString,
        email: session.customerEmail ?? null,
    };
    if (session.userId) {
        token.user = {
            id: session.userId.toString(),
            isAdmin: session.isAdmin ?? false,
            isOwner: session.isOwner ?? false,
        }
    }
    else {
        token.user = null;
    }
    await updateSessionToken(token);

    return Response.json(token);
}