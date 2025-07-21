/** 
 * https://github.com/atmulyana/nextCart
 **/
require('server-only');
const currentLocale = require('@/lib/currentLocale/server');
const {defaultLocale, texts} = require('./data.json');

const lang = (s, idx, locale) => {
    idx = idx ?? 0;
    locale = locale ?? currentLocale();
    return texts[s] && (
        texts[s][idx] && texts[s][idx][locale] ||
        texts[s][0] && texts[s][0][locale]
    ) || s;
}

exports = module.exports = lang;
exports.__esModule = true;
exports.default = lang;
exports.defaultLocale = defaultLocale;