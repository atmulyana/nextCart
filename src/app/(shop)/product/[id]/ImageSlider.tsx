'use client';
/** 
 * https://github.com/atmulyana/nextCart
 **/
import React from 'react';
import {Carousel, createTheme} from 'flowbite-react';
import {emptyString} from 'javascript-common';
import Rect from '@react-packages/rect';
import Icon from '@/components/Icon';
import cfg from '@/config/usable-on-client';
import type {TProductImagePath} from '@/data/types';
import FlexImage from '@/components/FlexImage';

const theme = createTheme({
    carousel: {
        root: {
            leftControl: "absolute top-0 left-0 flex h-full items-center justify-center pl-1 pr-5 focus:outline-hidden",
            rightControl: "absolute top-0 right-0 flex h-full items-center justify-center pr-1 pl-5 focus:outline-hidden",
        },
        item: {
            base: "absolute left-1/2 top-1/2 block w-full -translate-x-1/2 -translate-y-1/2",
            wrapper: {
                off: "relative w-full shrink-0 transform cursor-default snap-center",
                on: "relative w-full shrink-0 transform cursor-grab snap-center"
            }
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
                group-hover:bg-black/50 group-focus:outline-hidden group-focus:ring-4 group-focus:ring-black
                dark:bg-gray-800/30 dark:group-hover:bg-gray-800/60 dark:group-focus:ring-gray-800/70 sm:h-10 sm:w-10`,
            icon: "h-5 w-5 text-black dark:text-gray-200 sm:h-6 sm:w-6",
        },
    }
});

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
        <Rect ref={slider} className='rounded-sm'>
            <Carousel slide={false} theme={theme.carousel} onSlideChange={slideChange}>
                {/*eslint-disable-next-line @next/next/no-img-element*/}
                {images.map(img => <img key={img.id} src={`${cfg.baseUrl.path}${img.path}`} alt='...' />)}
            </Carousel>
        </Rect>
        <Thumbnails images={images} selectedIndex={selectedIndex} slider={slider} />
    </>;
});


function Thumbnails({
    images,
    selectedIndex,
    slider,
}: {
    images: TProductImagePath[],
    selectedIndex: number,
    slider: React.RefObject<HTMLDivElement | null>,
}) {
    const maxVisibleCount = 6;
    const maxStartIdx = images.length - maxVisibleCount;
    const [startVisibleIdx, setStartVisibleIdx] = React.useState(0);
    const setStart = (idx: number) => {
        if (idx > maxStartIdx) idx = maxStartIdx;
        if (idx < 0) idx = 0;
        setStartVisibleIdx(() => idx);
    }
    
    return <div className='group flex h-auto -mx-1 mt-4'>
        <button type='button'
            className={`btn-primary flex-none self-center flex items-center justify-center h-8 w-8 p-0 opacity-70 z-10
                invisible group-hover:visible ${startVisibleIdx < 1 ? 'hidden' : emptyString}`}
            onClick={() => setStart(startVisibleIdx - 1)}
        >
            <Icon name='chevron-left' height={24} width={24} strokeWidth={4} />
        </button>
        <div className={`image-slider-thumbnails flex-1 flex overflow-x-hidden
            ${startVisibleIdx < 1 ? 'ml-0' : '-ml-8'} ${startVisibleIdx >= maxStartIdx ? 'mr-0' : '-mr-8'}`}>
            {images.map((img, idx) => <div key={idx} className={`flex-none basis-1/6 px-1 ${idx < startVisibleIdx ? 'hidden' : emptyString}`}>
                <div
                    className={`w-full border-2 rounded-sm ${
                        selectedIndex==idx ? 'border-green-500 dark:border-pink-400' : 'border-transparent cursor-pointer'
                    }`}
                    onClick={() => {
                        const btns = slider.current?.querySelectorAll<HTMLButtonElement>('button[data-testid="carousel-indicator"]');
                        if (btns) btns[idx]?.click();
                    }}
                >
                    <FlexImage src={img.path} alt='...' />
                </div>
            </div>)}
        </div>
        <button type='button'
            className={`btn-primary flex-none self-center flex items-center justify-center h-8 w-8 p-0 opacity-70 z-10
                invisible group-hover:visible ${startVisibleIdx >= maxStartIdx ? 'hidden' : emptyString}`}
            onClick={() => setStart(startVisibleIdx + 1)}
        >
            <Icon name='chevron-right' height={24} width={24} strokeWidth={4} />
        </button>
    </div>;
}

export default ImageSlider;