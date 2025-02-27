/** 
 * https://github.com/atmulyana/nextCart
 **/
import {notFound} from 'next/navigation';
import {getOrdersByCustomerId} from '@/data/order';
import {getSession} from '@/data/session';
import {isIndexNumber} from '@/lib/common';
import {createGetHandler} from '@/lib/routeHandler';

export const GET = createGetHandler(async ({params: {pageIdx}}: {params: {pageIdx: any}}) => {
    const session = await getSession();
    if (!session.customerId || !isIndexNumber(pageIdx)) return notFound();
    return await getOrdersByCustomerId(session.customerId, parseInt(pageIdx));
});