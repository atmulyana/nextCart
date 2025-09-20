'use client';
/** 
 * https://github.com/atmulyana/nextCart
 **/
import React from 'react';
import {emptyString} from 'javascript-common';
import {isOnBrowser} from '@/lib/common';
import darkMode from '@/lib/darkMode';
import {inter} from '@/lib/font';
import '@/lib/currentLocale/client';

export default function Html({
    children,
    config,
    lang,
    locale,
}: {
    children: React.ReactNode,
    config: string,
    lang: {[s: string]: string},
    locale: string,
}) {
    let darkClass = emptyString;
    if (isOnBrowser()) {
        window.__config__ = JSON.parse(config);
        window.__currenLocale__ = locale;
        window.__lang__ = lang;
        darkMode.init();
        if (darkMode.isDark) darkClass = ' dark';
    }
    
    return <html lang={locale} className={`${inter.className}${darkClass}`}>
        {children}
    </html>;
}