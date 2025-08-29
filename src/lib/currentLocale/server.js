/** 
 * https://github.com/atmulyana/nextCart
 **/
const {cache} = require('react');
const {cookies} = require('next/headers');
//const {PassThrough} = require('stream');
const {defaultLocale} = require('@/config/config.json');

let getCookieLocale = () => {
    return cookies().get('locale')?.value;
}

 if (process.env.NODE_ENV == 'development') {
    const storage = require("next/dist/server/app-render/work-unit-async-storage.external");
    function cookies() {
        return storage.getExpectedRequestStore('cookies').cookies;
    }
    
    // const nullStream = new PassThrough();
    // nullStream.on('data', data => {
    //     //No data wriiten
    // });

    // const errConsole = process.stderr;
    // let stderr = process.stderr;
    // Object.defineProperty(process, 'stderr', {
    //     get() {
    //         return stderr;
    //     },
    // });
    
    getCookieLocale = () => {
        // stderr = nullStream;
        const locale = cookies().get('locale')?.value;
        // stderr = errConsole;
        return locale;
    };
}

function currentLocale() {
    try {
        return getCookieLocale() ?? defaultLocale;
    }
    catch {
        return defaultLocale;
    }
}

exports = module.exports = cache(currentLocale);
exports.__esModule = true;
exports.default = exports;