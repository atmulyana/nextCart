/** 
 * https://github.com/atmulyana/nextCart
 **/
import lang from '@/data/lang';
import {redirectWithMessage} from '@/lib/auth';
import {createGetHandler} from '@/lib/routeHandler';
import type {NotificationParam} from '@/subview/components/Notification';
import {clearPaymentId} from '../data';

export const GET = createGetHandler(async ({isFromMobile}) => {
    try {
        await clearPaymentId();
    }
    catch {}

    const obj: NotificationParam = {
        message: lang('The payment was cancelled'),
        type: 'danger',
    };

    if (isFromMobile) return Response.json({message: obj.message, messageType: obj.type});
    else return await redirectWithMessage(
        '/checkout/payment',
        obj
    );
});