/** 
 * https://github.com/atmulyana/nextCart
 **/
import React from 'react';

export default React.memo(function FlexImage({
    src,
    alt,
    className,
}: {
    src: string,
    alt: string,
    className?: string,
}) {
    return <div className='relative rounded w-full pt-full overflow-hidden bg-neutral-300 dark:bg-neutral-700'>
        <div className='absolute top-0 right-0 bottom-0 left-0'>
            <img className={`object-contain object-center ${className} !w-full !h-full`}
                src={src}
                alt={alt}
            />
        </div>
    </div>;
});