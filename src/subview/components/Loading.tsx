'use client';
/** 
 * https://github.com/atmulyana/nextCart
 **/
import React from 'react';

const Loading = React.memo(function Loading({
    isLoading,
    noBackdrop = false,
    percentSize,
}: {
    isLoading: (() => boolean) | boolean,
    noBackdrop?: boolean,
    percentSize?: number,
}) {
    const loading = typeof(isLoading) == 'function' ? isLoading() : isLoading;
    let size = '';
    if (percentSize??0 > 0) {
        size = `calc(${percentSize}% - 16px)`; //16px == borderWidth * 2
    }
    return <div className={`${loading ? 'block' : 'hidden'} absolute top-0 left-0 bottom-0 right-0 z-30`}>
        {!noBackdrop && <div className='h-full w-full bg-[var(--fg-color)] opacity-10'></div>}
        <div className='absolute top-0 left-0 bottom-0 right-0 z-10 flex items-center justify-center'>
            <div className='flex-initial box-content h-0 w-1/12 pt-1/12
                border-8 border-zinc-500 border-t-8 border-t-blue-500 rounded-[50%]
                animate-spin'
                style={size ? {width: size, paddingTop: size} : {}}
            ></div>
        </div>
    </div>;
});
export default Loading;