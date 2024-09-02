/** 
 * https://github.com/atmulyana/nextCart
 **/
import {notFound} from 'next/navigation';
import lang from '@/data/lang';
import {getOrder} from '@/data/order';
import {createGetHandler} from '@/lib/routeHandler';

export type Props = {
    params: {
        orderId: string,
    },
};

export const GET = createGetHandler(async ({params: {orderId}} : Props) => {
    const order = await getOrder(orderId);
    if (!order) return notFound();

    return {
        title: lang('Payment completed'),
        result: order,
    };
});