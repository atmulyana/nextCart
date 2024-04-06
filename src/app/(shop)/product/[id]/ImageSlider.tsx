'use client';
/** 
 * https://github.com/atmulyana/nextCart
 **/
import React from 'react';
import {Carousel, type CustomFlowbiteTheme} from 'flowbite-react';
import type {TProductImagePath} from '@/data/types';
import FlexImage from '@/components/FlexImage';

const theme: CustomFlowbiteTheme['carousel'] = {
    root: {
        leftControl: "absolute top-0 left-0 flex h-full items-center justify-center pl-1 pr-5 focus:outline-none",
        rightControl: "absolute top-0 right-0 flex h-full items-center justify-center pr-1 pl-5 focus:outline-none",
    },
    indicators: {
        active: {
            off: "bg-black/50 hover:bg-black dark:bg-gray-800/50 dark:hover:bg-gray-800",
            on: "bg-black dark:bg-gray-800",
        },
        wrapper: "absolute bottom-2 left-1/2 flex -translate-x-1/2 space-x-3",
    },
    control: {
        base: `inline-flex h-8 w-8 items-center justify-center rounded-full bg-black/30
               group-hover:bg-black/50 group-focus:outline-none group-focus:ring-4 group-focus:ring-black
               dark:bg-gray-800/30 dark:group-hover:bg-gray-800/60 dark:group-focus:ring-gray-800/70 sm:h-10 sm:w-10`,
        icon: "h-5 w-5 text-black dark:text-gray-200 sm:h-6 sm:w-6",
    },
};

const ImageSlider = React.memo(function ImageSlider(
    {images}: {images: TProductImagePath[]}
) {
    const [selectedIndex, setSelectedIndex] = React.useState(0);
    const slideChange = React.useCallback(
        (idx: number) => setSelectedIndex(idx),
        []
    );
    const slider = React.useRef<HTMLDivElement>(null);
    
    return <>
        <div className='relative rounded w-full pt-full overflow-hidden'>
            <div ref={slider} className='absolute top-0 right-0 bottom-0 left-0'>
            <Carousel slide={false} theme={theme} onSlideChange={slideChange}>
                {images.map(img => <img key={img.id} src={img.path} alt='...' />)}
            </Carousel>
            </div>
        </div>
        <div className='flex flex-wrap -mx-1 mt-4'>
            {images.map((img, idx) => <div key={idx} className='flex-none basis-1/6 px-1'>
                <div
                    className={`w-full border-2 rounded ${
                        selectedIndex==idx ? 'border-green-500 dark:border-pink-400' : 'border-transparent cursor-pointer'
                    }`}
                    onClick={() => {
                        const btns = slider.current?.querySelectorAll<HTMLButtonElement>('button[data-testid="carousel-indicator"]');
                        btns && btns[idx]?.click()
                    }}
                >
                    <FlexImage src={img.path} alt='...' />
                </div>
            </div>)}
        </div>
    </>;
});
export default ImageSlider;
