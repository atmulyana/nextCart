'use client';
/** 
 * https://github.com/atmulyana/nextCart
 **/
import React from 'react';
import DropDown from '@/components/DropDown';
import darkMode from '@/lib/darkMode';

type DarkModeMenuClientProps = {
    menuTitle: string,
    onTitle: string,
    offTitle: string,
    bySystemTitle: string,
};

export default function DarkModeMenuClient({menuTitle, onTitle, offTitle, bySystemTitle}: DarkModeMenuClientProps) {
    const [value, setValue] = React.useState<boolean|null>(null);
    React.useLayoutEffect(() => {
        setValue(darkMode.value);
    }, []);

    const iconChecked = 'check-square',
          iconNotChecked = 'square';
    return <DropDown
        className='btn-primary text-[16px]/none'
        label={menuTitle}
        items={[
            {
                label: onTitle,
                icon: value === true ? iconChecked : iconNotChecked,
                onClick: () => setValue(darkMode.value = true),
            },
            {
                label: offTitle,
                icon: value === false ? iconChecked : iconNotChecked,
                onClick: () => setValue(darkMode.value = false),
            },
            {
                label: bySystemTitle,
                icon: typeof(value) != 'boolean' ? iconChecked : iconNotChecked,
                onClick: () => setValue(darkMode.value = null),
            },
        ]}
    />;
}