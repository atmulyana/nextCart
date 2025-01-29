/** 
 * https://github.com/atmulyana/nextCart
 **/
import {getPublicPaymentConfig} from '@/lib/payments';
import {createGetHandler} from '@/lib/routeHandler';
import {generateMetadata} from '../page';

export const GET = createGetHandler(async () => {
    return {
        cartReadOnly: true,
        title: generateMetadata().title,
        paymentConfig: await getPublicPaymentConfig(),
    };
});