/** 
 * https://github.com/atmulyana/nextCart
 **/
import lang from '@/data/lang';
import {str} from '@/lib/common';
import {type Config, PublicString} from '../types';

export default {
    get description() {
        return str(lang('Payment by card via ${gateway}'), {gateway: 'Stripe'});
    },
    get buttonText() {
        return lang('Process Payment');
    },

    /***
     * Create `config-local.json` in the same directory to overwrite the value of `secretKey` and `publicKey`.
     * The file won't be uploaded to GIT repository
     ***/
    secretKey: "<YOUR STRIPE PRIVATE KEY>",
    publicKey: new PublicString("<YOUR STRIPE PUBLIC KEY>"),
    
    stripeCurrency: "usd",
    stripeDescription: "expressCart payment",
    stripeLogoURL: "http://localhost:1111/images/stripelogo.png",
    stripeWebhookSecret: "",
} as Config;