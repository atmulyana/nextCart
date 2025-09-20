'use server';
/** 
 * https://github.com/atmulyana/nextCart
 **/
import {emptyString} from 'javascript-common';
import {isPlainObject} from '@/lib/common';
import {projectRoot, serverRoot, saveFileText, saveJSON} from '@/lib/file-util';
import lang from '@/data/lang/server';
import config from '@/config/config';
import configClient from '@/config/usable-on-client';
import configEmail from '@/config/email';
import configSession from '@/config/session';
import {sendEmail} from '@/lib/email';
import {createFormAction} from "@/lib/routeHandler";

export const save = createFormAction(async (formData) => {
    let {customCss, googleAnalytics, ...commonCfg} = config;
    //eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {modules, baseUrl, ...cCfg} = configClient;
    const clientCfg = {...cCfg, baseUrl: baseUrl.toString().replace(/\/+$/, emptyString)}
    const emailCfg = {...configEmail};
    const sessionCfg = {...configSession};
    const configRoot = process.env.NODE_ENV != "production" 
        ? projectRoot() + '/src/config'
        : serverRoot() + '/config';

    const retrieveInput = (cfg: {[p: string]: any}, prefixName = emptyString) => {
        let count = 0;
        Object.keys(cfg).forEach(name => {
            if (isPlainObject(cfg[name])) {
                count += retrieveInput(cfg[name], name + '.');
            }
            else {
                const value = formData.get<any>(prefixName + name); //The `value` data type has been converted to the expected type by the validation rules
                                // (See `validate` function in "components/FormWithSchema/validation.ts" which calls `mergeData` function)
                if (value !== null && value !== cfg[name]) {
                    cfg[name] = value;
                    count++;
                }
            }
        });
        return count;
    };

    const gaEnabled = formData.get<boolean>('gaEnabled');
    let count = gaEnabled == !!googleAnalytics ? 0 : 1;
    if (gaEnabled) {
        if (!googleAnalytics) googleAnalytics = {
            gaId: emptyString,
            dataLayerName: emptyString,
            debugMode: false,
            script: emptyString,
        };
        count += retrieveInput(googleAnalytics, 'googleAnalytics.');
        if (!googleAnalytics.dataLayerName) delete googleAnalytics.dataLayerName;
        if (!googleAnalytics.debugMode) delete googleAnalytics.debugMode;
        if (!googleAnalytics.script) delete googleAnalytics.script;
    }
    else {
        googleAnalytics = null;
    }
    if (retrieveInput(commonCfg) + count > 0) {
        saveJSON(`${configRoot}/config.json`, {...commonCfg, googleAnalytics});
    }

    if (retrieveInput(clientCfg) > 0) {
        saveJSON(`${configRoot}/usable-on-client.json`, clientCfg);
        process.env.APP_BASE_URL = clientCfg.baseUrl;
        process.env.APP_GATEWAY = clientCfg.paymentGateway.join(',');
    }

    if (retrieveInput(emailCfg, 'email.') > 0) {
        saveJSON(`${configRoot}/email-local.json`, emailCfg);
    }
    
    if (typeof(sessionCfg.maxAge) == 'number') sessionCfg.maxAge /= 60;
    else (sessionCfg as any).maxAge = emptyString;
    if (retrieveInput(sessionCfg, 'session.') > 0) {
        if (typeof(sessionCfg.maxAge) == 'number') sessionCfg.maxAge *= 60;
        else sessionCfg.maxAge = null;
        saveJSON(`${configRoot}/session-local.json`, sessionCfg);
        process.env.AUTH_COOKIE_NAME = sessionCfg.paramName;
        process.env.AUTH_COOKIE_EXPIRES = sessionCfg.maxAge?.toString() || emptyString;
        process.env.AUTH_SECRET = sessionCfg.secret;
    }

    customCss = formData.get('customCss');
    if (customCss !== null) {
        /** TODO: Needs to call `less` parser */
        saveFileText(`${configRoot}/custom.less`, customCss);
    }
    
    return {
        message: lang('Settings data was updated. Please restart the application.'),
        messageType: 'success',
    };
});

export async function sendEmailTest(
    address: string,
    host: string,
    port: number,
    secure: boolean,
    user: string,
    pass: string
) {
    sendEmail(
        address,
        lang('nextCart email test'),
        lang('Your email settings are working'),
        {
            host,
            port,
            secure,
            auth: {
                user,
                pass,
            },
            from: address
        }
    )

    return {
        message: lang('Email test was sent'),
        messageType: 'success',
    };
}