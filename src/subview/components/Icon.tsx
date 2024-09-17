/** 
 * https://github.com/atmulyana/nextCart
 **/
import React from 'react';
const icons = require('react-icons/fi');

export default function Icon(
    {
        name,
        className,
        ...props
    }: {
        name: string,
        className?: string,
    } & React.ComponentProps<'svg'>
) {
    const iconName = 'Fi' + name.split('-').map(s => s.charAt(0).toUpperCase() + s.substring(1)).join('');
    const Icon = icons[iconName];
    if (!Icon) return null;
    
    const attrs = {
        className: `feather feather-${name}`,
        height: 16,
        width: 16,
        ...props,
    };
    if (className) attrs.className = `${attrs.className} ${className}`;

    return <Icon {...attrs} />;
}

export function getIcon(name: string) {
    const AnIcon = (props: React.ComponentProps<'svg'>) => <Icon name={name} {...props} />;
    AnIcon.displayName = `Icon-${name}`;
    return AnIcon;
}