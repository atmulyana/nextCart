/** 
 * https://github.com/atmulyana/nextCart
 **/
import React from 'react';
import Icon from '@/subview/components/Icon';
import DropDown from '@/subview/components/DropDown';
import config  from '@/config';
import currentLocale from '@/lib/currentLocale/server';

export default function LanguangeMenu({
    className='btn-primary',
    label = <Icon name='globe' />,
}: {
    className?: string,
    label?: React.ReactNode,
}) {
    const curLocale = currentLocale();
    return <DropDown
        className={className}
        label={label}
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