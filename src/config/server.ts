/** 
 * https://github.com/atmulyana/nextCart
 **/
import type {UsableOnClientConfig} from "./usable-on-client";
import type BaseURL from '@/lib/BaseURL';
const BURL = require('@/lib/BaseURL').default as typeof BaseURL;

let cfg!: UsableOnClientConfig;
if (process.env.NEXT_RUNTIME === 'edge') {
    cfg = {
        baseUrl: new BURL(process.env.APP_BASE_URL as string),
        paymentGateway: (process.env.APP_GATEWAY?.split(/\s*,\s*/) ?? []).filter(gw => !!gw),
    } as any;
}
else {
    const {readJSON} = require('@/lib/file-util');
    cfg = readJSON('/config/usable-on-client.json');
}
module.exports = {
    __esModule: false,
    config: cfg,
};