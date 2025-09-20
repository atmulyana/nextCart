"use client";
/** 
 * https://github.com/atmulyana/nextCart
 **/
const BaseURL = require('@/lib/BaseURL').default

module.exports = {
    __esModule: false,
    config: new Proxy({}, {
        get(_, prop) {
            const cfg = window.__config__;
            if (!cfg) return void(0);
            if (prop === "baseUrl") {
                const url = new BaseURL(cfg.baseUrl);
                url.protocol = location.protocol;
                url.host = location.host;
                return url;
            }
            return (cfg as any)[prop];
        }
    }),
};
