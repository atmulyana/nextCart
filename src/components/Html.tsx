'use client';
/** 
 * https://github.com/atmulyana/nextCart
 **/
import React from 'react';
import darkMode from '@/lib/darkMode';
import {inter} from '@/lib/font';

export default function Html({children}: {children: React.ReactNode}) {
    React.useLayoutEffect(() => {
        darkMode.init();
    }, []);

    return <html lang="en" className={inter.className}>
        {children}
    </html>;
}