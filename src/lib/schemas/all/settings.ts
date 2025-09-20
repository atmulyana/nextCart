/** 
 * https://github.com/atmulyana/nextCart
 **/
import {
    alwaysValid,
    boolean,
    email,
    length,
    max,
    min,
    numeric,
    integer,
    ReadOnlyRule,
    regex,
    Required,
    required,
    rule,
} from '@react-input-validator/rules';
import messages1 from '@react-input-validator/rules/messages';
import cfg from '@/config/usable-on-client';
import lang from '@/data/lang';
import {alphaNumericUdashRegex} from '@/lib/common';
import {Schema} from '..';
import messages2 from '../messages';
import {enums} from '../rules/Enum';
import {strval} from '../rules/StrVal';
import HtmlSanitized from '../rules/HtmlSanitized';

export default new Schema({
    cartTitle: [
        required,
        strval
    ],
    cartDescription: [
        required,
        strval
    ],
    cartLogo: [
        alwaysValid, //to trim
        rule(
            (sURL, param) => {
                let url: URL;
                try {
                    url = new URL(sURL, 'http://localhost');
                }
                catch {
                    return false;
                }
                
                if (
                    url.protocol != 'http:' && url.protocol != 'https:'
                    || url.pathname == '/' //usually, the image is not on the root default
                ) return false;

                if (/^https?:\/\//i.test(sURL)) param.resultValue = url.href;
                else param.resultValue = url.pathname + url.search + url.hash;
                return true;
            },
            lang(messages2.url)
        )
    ],
    baseUrl: [
        required,
        rule(value => {
            let message = lang(messages2.url),
                url: URL | undefined;
            message = message[0].toUpperCase() + message.substring(1);
            const errors: string[] = [];
            try {
                url = new URL(value);
            }
            catch {
                errors.push(message);
            }
            if (url) {
                if (url.protocol != 'http:' && url.protocol != 'https:') {
                    errors.push(lang(messages2.baseProtocol));
                }
                if (url.username || url.password || url.search || url.hash) {
                    errors.push(lang(messages2.baseUrl));
                }
                if (url.pathname != cfg.baseUrl.pathname) {
                    errors.push(lang(messages2.basePath));
                }
            }
            if (errors.length > 0) {
                if (errors[0] != message) errors.unshift(message);
                return errors.join('. ') + '.';
            }
            return true;
        }),
    ],
    enableLanguages: [
        required,
        boolean,
    ],
    defaultLocale: [
        required,
        enums(Object.keys(cfg.availableLanguages)),
    ],
    paymentGateway: [
        new Required().arrayAsSingle(),
        rule((value, param) => {
            if (!Array.isArray(value)) {
                param.resultValue = [value];
            }
            return true;
        }).arrayAsSingle(),
    ],
    currencySymbol: [
        required,
        strval
    ],
    currencyISO: [
        required.if((_, param) => {
            return Array.isArray(param.inputValues?.paymentGateway) && param.inputValues.paymentGateway.includes('blockonomics')
                || param.inputValues?.paymentGateway == 'blockonomics';
        }),
        enums(['USD', 'EUR', 'GBP']),
    ],
    productsPerRow: [
        required,
        numeric,
        enums([1, 2, 3, 4])
    ],
    productsPerPage: [
        new Required().setErrorMessage(lang(messages1.numeric)),
        numeric,
        integer,
        min(function(this: ReadOnlyRule) {
            const minVal = parseInt(this.inputValues?.productsPerRow) || 1;
            return minVal;
        })
    ],
    productOrderBy: [
        required,
        enums(['date', 'title'])
    ],
    productOrder: [
        required,
        enums(['ascending', 'descending'])
    ],
    showHomepageVariants: [
        required,
        boolean,
    ],
    showRelatedProducts: [
        required,
        boolean,
    ],
    maxQuantity: [
        new Required().setErrorMessage(lang(messages1.numeric)),
        numeric,
        integer,
        min(0)
    ],
    trackStock: [
        required,
        boolean,
    ],
    itemsPerPage: [
        new Required().setErrorMessage(lang(messages1.numeric)),
        numeric,
        integer,
        min(1)
    ],
    'footer.html': [
        alwaysValid, //to trim
        strval,
        new HtmlSanitized(),
    ],
    'footer.shownForCustomer': [
        required,
        boolean
    ],
    'footer.shownForAdmin': [
        required,
        boolean
    ],
    customCss: [
        alwaysValid,
        strval,
    ],
    gaEnabled: [
        required,
        boolean,
    ],
    'googleAnalytics.gaId': [
        required.if((_, param) => param.inputValues?.gaEnabled),
        strval,
    ],
    'googleAnalytics.dataLayerName': [
        alwaysValid, //to trim
        regex(/^[a-zA-z$_][a-zA-z$_0-9]*$/).setErrorMessage(lang(messages2.variableName)),
    ],
    'googleAnalytics.debugMode': [
        alwaysValid,
        boolean,
    ],
    'googleAnalytics.script': [
        alwaysValid,
        strval,
    ],
    'email.fromAddress': [
        required,
        email
    ],
    'email.host': [
        required,
        strval,
    ],
    'email.port': [
        required,
        numeric,
        integer,
        min(1),
        max(65535),
    ],
    'email.secure': [
        required,
        boolean
    ],
    'email.user': [
        alwaysValid,
        strval
    ],
    'email.password': [
        alwaysValid,
        strval,
    ],
    'session.paramName': [
        required,
        regex(alphaNumericUdashRegex).setErrorMessage(lang(messages2.alphaNumericUdash)),
    ],
    'session.maxAge': [
        alwaysValid,
        numeric,
        integer,
        min(15)
    ],
    'session.secret': [
        required,
        strval,
        length(8),
    ]
});