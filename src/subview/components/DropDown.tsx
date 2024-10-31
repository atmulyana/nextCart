"use client";
/** 
 * https://github.com/atmulyana/nextCart
 **/
import React from "react";
import {Dropdown, theme, type DropdownProps, DropdownItemProps} from 'flowbite-react';
import cfg from '@/config/usable-on-client';
import {getIcon} from './Icon';
const menuBoxStyle = theme.dropdown.floating.base.replace('z-10', 'z-50');

export type DropDownItem = {
    label: React.ReactNode,
    icon?: string,
    useReferrer?: boolean,
} & Omit<DropdownItemProps, "icon">;
export type DropDownProps = {
    className?: string,
    label: React.ReactNode,
    items: Array<DropDownItem | null>,
}

export default function DropDown({className, label, items}: DropDownProps): React.ReactElement {
    let theme: NonNullable<DropdownProps['theme']> = {
        arrowIcon: 'ml-1 w-2 h-2',
        floating: {
            base: menuBoxStyle,
        }
    };
    if (className) theme.inlineWrapper = `flex items-center ${className}`;
    return <Dropdown theme={theme} label={label} inline data-dropdown-offset-distance={0}>
        {items.map((item, idx) => {
            if (item) {
                const {icon, label, href, useReferrer, ...props} = item;
                const jsxIcon = icon && getIcon(icon) || undefined;
                if (typeof(location) != 'undefined' && href && useReferrer) {
                    const url = href == '#' ? '#' : new URL(cfg.baseUrl.path + href, location.href);
                    return <Dropdown.Item
                            key={idx}
                            {...props}
                            icon={jsxIcon}
                            onClick={() => {
                                if (url instanceof URL) {
                                    url.searchParams.set('referrer', location.pathname.substring(cfg.baseUrl.path.length) + location.search);
                                    location.href = url.toString();
                                }
                            }}
                        >{label}</Dropdown.Item>;
                }
                return  <Dropdown.Item
                        key={idx}
                        {...props}
                        href={href}
                        icon={jsxIcon}
                    >{label}</Dropdown.Item>;
            }
            else {
                return <Dropdown.Divider key={idx} />
            }
        })}
    </Dropdown>;
}