/** 
 * https://github.com/atmulyana/nextCart
 **/
import {
    boolean,
    length,
    lengthMax,
    regex,
    required,
} from '@react-input-validator/rules';
import lang from '@/data/lang';
import {alphaNumericUdashRegex} from '@/lib/common';
import {Schema} from '..';
import messages from '../messages';
import HtmlRequired from '../rules/HtmlRequired';
import HtmlSanitized from '../rules/HtmlSanitized';
import NoHtml from '../rules/NoHtml';

export default new Schema({
    name: [
        required,
        new NoHtml(),
        lengthMax(30),
    ],
    slug: [
        required,
        regex(alphaNumericUdashRegex).setErrorMessage(lang(messages.alphaNumericUdash)),
        length(2),
    ],
    enabled: [
        required,
        boolean,
    ],
    content: [
        new HtmlRequired(),
        new HtmlSanitized(),
        length(50)
    ],
});