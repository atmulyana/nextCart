/** 
 * https://github.com/atmulyana/nextCart
 **/
import lang from '@/data/lang/server';
import {createGetHandler} from '@/lib/routeHandler';
import type {NotificationParam} from '@/components/Notification';
import {clearPaymentId} from '../data';

export const GET = createGetHandler(async ({isFromMobile, redirect}) => {
    try {
        await clearPaymentId();
    }
    catch {}

    const notification = {
        message: lang('The payment was cancelled'),
        messageType: 'danger' as NotificationParam['type'],
    };

    if (isFromMobile) return Response.json(notification);
    else return await redirect(
        '/checkout/payment',
        notification
    );
});