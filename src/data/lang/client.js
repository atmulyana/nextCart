/** 
 * https://github.com/atmulyana/nextCart
 **/
const defaultLocale = 'en';
const lang = s => global.__lang__ && global.__lang__[s] || s;

exports = module.exports = lang;
exports.__esModule = true;
exports.default = lang;
exports.defaultLocale = defaultLocale;