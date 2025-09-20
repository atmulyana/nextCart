/** 
 * https://github.com/atmulyana/nextCart
 **/
const clientCfg = require('@/config/client');
function currentLocale() {
    return global.__currenLocale__ || clientCfg.defaultLocale;
};
exports = module.exports = currentLocale;
exports.__esModule = true;
exports.default = exports;