/** 
 * https://github.com/atmulyana/nextCart
 **/
import {
    alwaysValid,
    boolean,
    integer,
    length,
    lengthMax,
    min,
    numeric,
    regex,
    required,
    Required,
} from '@react-input-validator/rules';
import config from '@/config/usable-on-client';
import lang from '@/data/lang';
import {Schema} from '..';
import messages from '../messages';
import HtmlRequired from '../rules/HtmlRequired';
import HtmlSanitized from '../rules/HtmlSanitized';
import NoHtml from '../rules/NoHtml';

export default new Schema({
    title: [
        required,
        new NoHtml(),
        length(5, 200),
    ],
    price: [
        new Required().setErrorMessage(lang('invalid')),
        regex(/^\d+(\.\d{1,2})?$/).setErrorMessage(lang(messages.price)),
        numeric
    ],
    gtin: [
        regex(/^[A-Za-z0-9]+$/).setErrorMessage(lang(messages.productGtin)),
        lengthMax(16),
    ],
    brand: [
        new NoHtml(),
        lengthMax(50)
    ],
    published: [
        required,
        boolean,
    ],
    stock: config.trackStock ? [
        required,
        numeric,
        integer,
        min(0),
    ]: alwaysValid,
    stockDisable: config.trackStock ? boolean : alwaysValid,
    description: [
        new HtmlRequired(),
        new HtmlSanitized(),
        length(50)
    ],
    permalink: [
        alwaysValid, //to trim the value
        length(2),
    ],
    allowComment: [required, boolean]
});