/** 
 * https://github.com/atmulyana/nextCart
 **/
import lang from '@/data/lang/server';
import {str} from '@/lib/common';
import type {Config} from '../types';

export default {
    get description() {
        return str(lang('Payment via ${gateway}'), {gateway: 'Paypal'});
    },
    get buttonText() {
        return lang('Pay now');
    },

    /***
     * Create `config-local.json` in the same directory to overwrite the value of `mode`, `client_id` and `client_secret`.
     * The file won't be uploaded to GIT repository
     ***/
    mode: "sandbox",
    client_id: "<Your Paypal client ID>",
    client_secret: "<Your Paypal client secret>",
    
    paypalCartDescription: "BKLYN",
    paypalCurrency: "USD",
} as Config;