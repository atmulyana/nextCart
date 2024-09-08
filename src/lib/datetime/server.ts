/** 
 * https://github.com/atmulyana/nextCart
 **/
import lang from '@/data/lang';
import currentLocale from '../currentLocale/server';
import fn from './_fn';

export const {formatDate, timeAgo} = fn(lang, currentLocale);