/** 
 * https://github.com/atmulyana/nextCart
 **/
import {defaultLocale, lang} from './types';

declare global {
    interface Window {
        __lang__: {[s: string]: string}
    }
}

export {defaultLocale};
export default lang;