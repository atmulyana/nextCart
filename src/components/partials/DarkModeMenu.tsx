/** 
 * https://github.com/atmulyana/nextCart
 **/
import React from 'react';
import DarkModeMenuClient from './DarkModeMenuClient';
import lang from '@/data/lang';

export default function DarkModeMenu({
    className,
    label = lang('Dark Mode'),
}: {
    className?: string,
    label?: React.ReactNode,
}) {
    return <DarkModeMenuClient
        className={className}
        menuTitle={label}
        onTitle={lang('On')}
        offTitle={lang('Off')}
        bySystemTitle={lang('By system')}
    />;
}