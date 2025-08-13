/** 
 * https://github.com/atmulyana/nextCart
 **/
import React from 'react';
import cfg from '@/config/usable-on-client';

export default React.memo(function FlexImage({
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
    return <div className={`relative rounded-sm w-full pt-full overflow-hidden ${bgClassName}`}>
        <div className='absolute top-0 right-0 bottom-0 left-0'>
            {/*eslint-disable-next-line @next/next/no-img-element*/}
            <img className={`object-contain object-center ${className} !w-full !h-full`}
                src={src}
                alt={alt}
            />
        </div>
    </div>;
});