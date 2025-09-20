/** 
 * https://github.com/atmulyana/nextCart
 **/
import {readFileText, readJSON} from '@/lib/file-util';
import './config.json';
import './custom.less';

type Config = {
    cartDescription: string,
    cartLogo: string,
    footer: {
        html: string | null,
        shownForCustomer: boolean,
        shownForAdmin: boolean,
    },
    customCss: string,
    databaseConnectionString: string,
    productOrderBy: string,
    productOrder:  'ascending' | 'descending',
    twitterHandle: string,
    facebookAppId: string,
    googleAnalytics: null | {
        gaId: string,
        dataLayerName?: string,
        debugMode?: boolean,
        script?: string,
    },
};

let cfg!: Config;
if (!cfg) {
    cfg = {
        ...readJSON<Config>('/config/config.json'),
        customCss: readFileText('/config/custom.less')
    };
}

export default cfg;