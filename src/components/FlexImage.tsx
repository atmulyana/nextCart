/** 
 * https://github.com/atmulyana/nextCart
 **/
import React from 'react';
import {FlexImage} from '@react-packages/rect';
import cfg from '@/config/usable-on-client';

export default React.memo(function FlexiImage({
    src,
    alt,
    bgClassName = 'bg-neutral-300 dark:bg-neutral-700',
    className,
}: {
    src: string,
    alt: string,
    bgClassName?: string,
    className?: string,
}) {
    if (src.startsWith('/')) src = cfg.baseUrl.path + src;
    return <FlexImage 
        alt={alt}
        bg={{
            className: `rounded-sm ${bgClassName}`
        }}
        className={className}
        src={src}
        vertical={false}
    />;
});