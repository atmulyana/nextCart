/** 
 * https://github.com/atmulyana/nextCart
 **/
import {notFound} from 'next/navigation';
import {getPublicPaymentConfig, getRouteModule} from '@/lib/payments';
import {createGetHandler} from '@/lib/routeHandler';

export const GET = createGetHandler(async ({headers}) => {
    const mod = await getRouteModule(headers);
    if (!mod.getData) return notFound();
    let data = mod.getData();
    if (data instanceof Promise) data = await data;
    data.paymentConfig = await getPublicPaymentConfig();
    return data;
});