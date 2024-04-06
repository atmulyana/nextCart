/** 
 * https://github.com/atmulyana/nextCart
 **/
import moduleConfig from '@/lib/modules/config';

export type UsableOnClientConfig = {
    cartTitle: string,
    baseUrl: string,
    productsPerRow: 1 | 2 | 3 | 4,
    productsPerPage: number,
    currencySymbol: string,
    currencyISO: string,
    maxQuantity: number,
    paymentGateway: string[],
    trackStock: boolean,
    showRelatedProducts: boolean,
    showHomepageVariants: boolean,
};

const config = require('./usable-on-client.json') as UsableOnClientConfig;
export default {
    ...config,
    modules: {
        enabled: { 
            ...moduleConfig,
        },
        loaded: {
            ...moduleConfig,
        },
    },
};