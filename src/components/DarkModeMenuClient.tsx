'use client';
/** 
 * https://github.com/atmulyana/nextCart
 **/
import React from 'react';
import DropDown from './DropDown';

declare var $$darkMode: {
    value: boolean | null,
    readonly isDark: boolean,
}

type DarkModeMenuClientProps = {
    menuTitle: string,
    onTitle: string,
    offTitle: string,
    bySystemTitle: string,
}

export default function DarkModeMenuClient({menuTitle, onTitle, offTitle, bySystemTitle}: DarkModeMenuClientProps) {
    let isRendered = false;
    const [value, setValue] = React.useState<boolean|null|undefined>(typeof($$darkMode) == 'object' ? $$darkMode.value : undefined);
    
    React.useEffect(() => {
        if (!isRendered) {
            const fn = () => {
                //will be checking until "/scripts/darkMode.js" is loaded
                if (typeof($$darkMode) == 'undefined') setTimeout(fn, 100);
                else setValue($$darkMode.value);
            }
            setTimeout(fn, 100);
        }
    //eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    //if "/scripts/darkMode.js" is not loaded yet, don't render anything
    if (typeof($$darkMode) == 'undefined') return null;

    isRendered = true;
    const iconChecked = 'check-square',
          iconNotChecked = 'square';
    return <DropDown
        className='btn-primary text-[16px]/none'
        label={menuTitle}
        items={[
            {
                label: onTitle,
                icon: value === true ? iconChecked : iconNotChecked,
                onClick: () => setValue($$darkMode.value = true),
            },
            {
                label: offTitle,
                icon: value === false ? iconChecked : iconNotChecked,
                onClick: () => setValue($$darkMode.value = false),
            },
            {
                label: bySystemTitle,
                icon: typeof(value) != 'boolean' ? iconChecked : iconNotChecked,
                onClick: () => setValue($$darkMode.value = null),
            },
        ]}
    />;
}