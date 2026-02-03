/** 
 * https://github.com/atmulyana/nextCart
 **/
const storage = require("next/dist/server/app-render/work-unit-async-storage.external");
const {defaultLocale} = require('@/config/server').config;

const cache = new WeakMap();
function currentLocale() {
    const requestStore = storage.workUnitAsyncStorage.getStore(); //Different for each HTTP request
    if (!requestStore) return defaultLocale;
    let locale = cache.get(requestStore);
    if (locale) return locale;
    locale = requestStore.cookies?.get('locale')?.value ?? defaultLocale;
    cache.set(requestStore, locale);
    return locale;
}

exports = module.exports = currentLocale;
exports.__esModule = true;
exports.default = exports;