/** 
 * https://github.com/atmulyana/nextCart
 **/
import BaseURL from '@/lib/BaseURL';
import moduleConfig from '@/lib/modules/config';
import './usable-on-client.json';

export type UsableOnClientConfig = {
    enableLanguages: boolean,
    availableLanguages: {[locale: string]: string},
    defaultLocale: string,
    currencySymbol: string,
    currencyISO: string,
    productsPerRow: 1 | 2 | 3 | 4,
    productsPerPage: number,
    itemsPerPage: number,
    maxQuantity: number,
    trackStock: boolean,
    showRelatedProducts: boolean,
    showHomepageVariants: boolean,
    paymentGateway: string[],
    cartTitle: string,
    baseUrl: BaseURL,
    modules: {
        enabled: { 
            discount?: string,
            reviews?: string,
            shipping?: string,
        },
        loaded: {
            discount?: string,
            reviews?: string,
            shipping?: string,
        },
    },
};

declare global {
    interface Window {
        __config__: UsableOnClientConfig;
    }
    var __config__: UsableOnClientConfig;
}

let cfg!: UsableOnClientConfig;
if (!cfg) {
    if (typeof(window) == 'object') {
        cfg = require('./client').config;
    }
    else {
        cfg = require('@__server__').config;
        if (!cfg) { //Server-side rendering for client component
            cfg = global.__config__;
        }
        const {baseUrl, ...baseConfig} = cfg;
        cfg = {
            ...baseConfig,
            get baseUrl() {
                return new BaseURL(process.env.APP_BASE_URL || baseUrl);
            },
            modules: {
                enabled: { 
                    ...moduleConfig,
                },
                loaded: {
                    ...moduleConfig,
                },
            },
        };
    }
    
    global.__config__ = cfg;
}
export default cfg;