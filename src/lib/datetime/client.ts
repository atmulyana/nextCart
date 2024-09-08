'use client';
/** 
 * https://github.com/atmulyana/nextCart
 **/
import currentLocale from '../currentLocale/client';
import fn from './_fn';

const texts: {
    [s: string]: {
        [locale: string]: string
    }
} = {
    Ago: {
        id: 'Yang lalu',
        it: 'Fa',
    },
};
function lang(s: string) {
    return texts[s] && texts[s][currentLocale()] || s;
} 

export const {formatDate, timeAgo} = fn(lang, currentLocale);