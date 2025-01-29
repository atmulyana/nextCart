/** 
 * https://github.com/atmulyana/nextCart
 **/
import lang from '@/data/lang';
import {str} from '@/lib/common';
import {PublicString, type Config} from '../types';

/***
 * Create `config-local.json` in the same directory to overwrite the value of the configuration properties.
 * Especially for the value of `apiKey`. The file won't be uploaded to GIT repository.
 ***/
export default {
    get description() {
        return lang('Blockonomics payment');
    },
    get buttonText() {
        return str(lang('Pay with ${money}'), {money: 'Bitcoin'});
    },

    //Overwrite in `config-local.json`
    apiKey: "<Your Blockonomics API key>",
    
    hostUrl: new PublicString("https://www.blockonomics.co"),
    newAddressApi: "/api/new_address",
    priceApi: "/api/price?currency=",
} as Config;