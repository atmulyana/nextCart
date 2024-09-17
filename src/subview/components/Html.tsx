'use client';
/** 
 * https://github.com/atmulyana/nextCart
 **/
import React from 'react';
import darkMode from '@/lib/darkMode';
import {inter} from '@/lib/font';
import '@/lib/currentLocale/client';

export default function Html({children, locale}: {children: React.ReactNode, locale: string}) {
    let darkClass = '';
    if (typeof(window) != 'undefined') {
        window.__currenLocale__ = locale;
        darkMode.init();
        if (darkMode.isDark) darkClass = ' dark';
    }
    
    return <html lang={locale} className={`${inter.className}${darkClass}`}>
        {children}
    </html>;
}