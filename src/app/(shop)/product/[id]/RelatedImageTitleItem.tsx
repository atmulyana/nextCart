'use client';
/** 
 * https://github.com/atmulyana/nextCart
 **/
import React from 'react';
import Link from 'next/link';
import FlexImage from '@/components/FlexImage';

export default function RelatedImageTitleItem({item}: {item: {title: string, link: string, imageUrl: string}}) {
    const ref = React.useRef<HTMLAnchorElement>(null);
    const [display, setDisplay] = React.useState('none')
    const [width, setWidth] = React.useState('0px');
    
    React.useEffect(() => {
        function hideTitle() {
            setDisplay('none'); //`Title` has an absolute width (in 'px'). Hiding it is to make container resizes to fit the new size of window.
        }

        window.addEventListener('resize', hideTitle);
        return () => window.removeEventListener('resize', hideTitle);
    }, []);

    React.useLayoutEffect(() => {
        if (display == 'none') {
            if (!ref.current) return;
            const {width} = ref.current.getBoundingClientRect();
            setWidth(width + 'px'); //needed to make `text-ellipsis` works (`width` must be set and not in persent)
            setDisplay('block')
        }
    }, [display])

    return <Link ref={ref}
        href={`/product/${item.link}`}
        className='block min-w-0 overflow-hidden'
        prefetch={false}
    >
        <FlexImage src={item.imageUrl} alt='...' />
        <h5
            className='text-center mt-2.5 overflow-hidden text-ellipsis whitespace-nowrap'
            style={{display, width}}
        >{item.title}</h5>
    </Link>;
}