/** 
 * https://github.com/atmulyana/nextCart
 **/
import {isOnBrowser} from "@/lib/common";
let defaultLocale: string,
    lang: (s: string, idx?: number, locale?: string) => string,
    mod: any;
if (isOnBrowser()) {
    mod = require('./client');
}
else {
    mod = require('@__server__');
}
({default: lang, defaultLocale} = mod);
export default lang;
export {defaultLocale};