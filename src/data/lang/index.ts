/** 
 * https://github.com/atmulyana/nextCart
 **/
import 'server-only';
import currentLocale from '@/lib/currentLocale/server';

const {defaultLocale, texts} = require('./data.json') as {
    defaultLocale: string,
    texts: {[s: string]: Array<{[locale: string]: string}>},
};

const lang = (s: string, idx: number = 0, locale: string = currentLocale()) => {
    return texts[s] && (
        texts[s][idx] && texts[s][idx][locale] ||
        texts[s][0] && texts[s][0][locale]
    ) || s;
}

export default lang;
export {defaultLocale};