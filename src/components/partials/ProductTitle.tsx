'use client';
/** 
 * https://github.com/atmulyana/nextCart
 * 
 * This component is only to display the product title. It exists in order to make CSS `text-overflow: ellipsis` works.
 **/
import React from 'react';

export default function ProductTitle({title}: {title: string}) {
    const container = React.useRef<HTMLDivElement>(null);
    const [width, setWidth] = React.useState('0px');

    React.useLayoutEffect(() => {
        if (container.current && width == '0px') {
            setWidth((container.current.offsetWidth - 1) + 'px');
        }
    }, [width]);

    React.useEffect(() => {
        const resizeHandler = () => setWidth('0px');
        window.addEventListener('resize', resizeHandler);
        return () => window.removeEventListener('resize', resizeHandler);
    }, []);

    return <div ref={container} className='mt-0 pt-2.5'>
        <h6 className='overflow-hidden text-center text-lg text-ellipsis whitespace-nowrap' style={{width}}>{title}</h6>
    </div>;
}