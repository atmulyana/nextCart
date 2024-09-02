/** 
 * https://github.com/atmulyana/nextCart
 **/
import {getPaymentConfig} from '@/lib/payments';
import {createGetHandler} from '@/lib/routeHandler';
import {generateMetadata} from '../page';

export const GET = createGetHandler(async () => {
    return {
        title: generateMetadata().title,
        paymentConfig: await getPaymentConfig(),
    };
});