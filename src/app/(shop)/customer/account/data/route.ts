/** 
 * https://github.com/atmulyana/nextCart
 **/
import {notFound} from 'next/navigation';
import lang from '@/data/lang';
import {getOrders} from '@/data/order';
import {getSession} from '@/data/session';
import {createGetHandler} from '@/lib/routeHandler';

export const GET = createGetHandler(async () => {
    const session = await getSession();
    if (!session.customerId) return notFound();
    const {list: orders, isNext, page} = await getOrders(session.customerId);
    return {
        title: lang('Orders'),
        orders,
        isNext,
        page,
    };
});