/** 
 * https://github.com/atmulyana/nextCart
 **/
import lang from '@/data/lang/server';
import type {Config} from '../types';

export default {
    get description() {
        return lang('Instore pickup');
    },
    get buttonText() {
        return lang('Place order, pay instore');
    },
    orderStatus: 'Pending',
    get resultMessage() {
        return lang('The order is place. Please pay for your order instore on pickup.');
    },
} as Config;