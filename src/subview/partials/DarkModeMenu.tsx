/** 
 * https://github.com/atmulyana/nextCart
 **/
import React from 'react';
import DarkModeMenuClient from './DarkModeMenuClient';
import lang from '@/data/lang';

export default function DarkModeMenu() {
    return <DarkModeMenuClient
        menuTitle={lang('Dark Mode')}
        onTitle={lang('On')}
        offTitle={lang('Off')}
        bySystemTitle={lang('By system')}
    />;
}