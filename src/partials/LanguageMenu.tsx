/** 
 * https://github.com/atmulyana/nextCart
 **/
import React from 'react';
import Icon from '@/components/Icon';
import DropDown from '@/components/DropDown';
import config  from '@/config';
import currentLocale from '@/lib/currentLocale/server';

export default function LanguangeMenu() {
    const curLocale = currentLocale();
    return <DropDown
        className='btn-primary'
        label={<Icon name='globe' />}
        items={Object.entries(config.availableLanguages)
            .map(([locale, name]) => ({
                href: curLocale == locale ? '#' : `/lang/${locale}`,
                useReferrer: true,
                label: name,
                icon: locale == curLocale ? 'check-square' : 'square',
            }))
        }
    />;
}