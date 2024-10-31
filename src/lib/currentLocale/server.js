/** 
 * https://github.com/atmulyana/nextCart
 **/
import {cookies} from 'next/headers';
import config from '@/config';
let {defaultLocale} = config;

function currentLocale() {
    try {
        return cookies().get('locale')?.value ?? defaultLocale;
    }
    catch {
        return defaultLocale;
    }
}

export default currentLocale;