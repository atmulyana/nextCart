/** 
 * https://github.com/atmulyana/nextCart
 **/
import moduleConfig from '@/lib/modules/config';

export type UsableOnClientConfig = {
    cartTitle: string,
    baseUrl: BaseURL,
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

class BaseURL extends URL {
    static reDirSepTrimEnd = /\/+$/;
    constructor(input: string | URL, base?: string | URL) {
        super(input, base);
        this.username = '';
        this.password = '';
        this.search = '';
        this.hash = '';
    }

    get path() {
        return super.pathname.replace(BaseURL.reDirSepTrimEnd, '');
    }

    get pathname() {
        return this.path || '/';
    }

    toString() {
        const str = super.toString();
        return str.replace(BaseURL.reDirSepTrimEnd, '');
    }
}

const {baseUrl, ...baseConfig} = require('./usable-on-client.json') as UsableOnClientConfig;
const config = {
    ...baseConfig,
    get baseUrl() {
        if (typeof(location) == 'object') { //on client browser
            const url = new BaseURL(baseUrl);
            url.protocol = location.protocol;
            url.host = location.host;
            return url;
        }
        return new BaseURL(process?.env?.BASE_URL || baseUrl);
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
export default config;