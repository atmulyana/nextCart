/** 
 * https://github.com/atmulyana/nextCart
 **/
import {
    length,
    numeric,
    regex,
    required,
    Required,
    rule,
} from '@react-input-validator/rules';
import {date} from '@react-input-validator/rules-datetime';
import dateMessages from '@react-input-validator/rules-datetime/messages';
import lang from '@/data/lang';
import {alphaNumericUdashRegex} from '@/lib/common';
import {Schema} from '..';
import messages from '../messages';

const datetimeRule = date('yyyy-MM-ddTHH:mm');

export default new Schema({
    value: [
        required,
        numeric,
        rule(
            value => value > 0,
            lang(messages.discountValue),
        )
    ],
    code: [
        required,
        regex(alphaNumericUdashRegex).setErrorMessage(lang(messages.alphaNumericUdash)),
        length(2),
    ],
    type: [
        required,
        rule(
            value => value == 'percent' || value == 'amount',
            lang(messages.discountType),
        )
    ],
    start: [
        new Required().setErrorMessage(lang(dateMessages.date)),
        datetimeRule,
        rule(value => {
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            if (value < today) return lang(messages.discountStart);
            return true;
        }),
    ],
    end: [
        new Required().setErrorMessage(lang(dateMessages.date)),
        datetimeRule,
        rule((value, {inputValues}) => {
            const now = new Date();
            if (value <= now) return lang(messages.discountEndNow);
            let start: any = inputValues?.start;
            if (typeof(start) == 'string') { //on client; on server, it's been a Date object
                start = datetimeRule.parse(start);
            }
            if ((start instanceof Date) && value < start) return lang(messages.discountEndStart);
            return true;
        }),
    ],
});