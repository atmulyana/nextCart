'use client';
/** 
 * https://github.com/atmulyana/nextCart
 **/
import React from 'react';
import {Carousel, createTheme} from 'flowbite-react';
import {emptyArray, emptyString} from 'javascript-common';
import Rect, {styles as rectStyles} from '@react-packages/rect';
import {createComponent, isHoverSupported, type RefInstance as SliderRef} from '@react-packages/simple-images-slider';
import Icon from '@/components/Icon';
import cfg from '@/config/usable-on-client';
import type {TProductImagePath} from '@/data/types';

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
    {
        images,
        sliderRef,
    }: {
        images: TProductImagePath[],
        sliderRef: React.RefObject<SliderRef | null>,
    }
) {
    const [selectedIndex, setSelectedIndex] = React.useState(0);
    const slideChange = React.useCallback(
        (idx: number) => setSelectedIndex(idx),
        emptyArray
    );
    
    const slider = React.useRef<HTMLDivElement>(null);
    const thumbnailsChange = React.useCallback(({selected}: {selected: number}) => {
        const btns = slider.current?.querySelectorAll<HTMLButtonElement>('button[data-testid="carousel-indicator"]');
        if (btns) btns[selected]?.click();
    }, emptyArray);

    const thumbnails = React.useRef<SliderRef>(null);
    React.useEffect(() => {
        const oldValue = sliderRef.current;
        Object.defineProperty(sliderRef, 'current', {
            configurable: true,
            enumerable: true,
            get() {
                return thumbnails.current;
            }
        });
        return () => {
            Object.defineProperty(sliderRef, 'current', {
                configurable: true,
                enumerable: true,
                value: oldValue,
                writable: true,
            });
        };
    }, [sliderRef]);

    return <>
        <Rect ref={slider} className='rounded-sm'>
            <Carousel slide={false} theme={theme.carousel} onSlideChange={slideChange}>
                {/*eslint-disable-next-line @next/next/no-img-element*/}
                {images.map(img => <img key={img.id} src={`${cfg.baseUrl.path}${img.path}`} alt='...' />)}
            </Carousel>
        </Rect>
        <Thumbnails
            ref={thumbnails}
            images={images.map(img => img.path)}
            onChange={thumbnailsChange}
            selectedIndex={selectedIndex}
        />
    </>;
});

const Thumbnails = createComponent({
    hiddenFirst: true,
    leftButtonContent: <Icon name='chevron-left' height={24} width={24} strokeWidth={4} />,
    rightButtonContent: <Icon name='chevron-right' height={24} width={24} strokeWidth={4} />,
    styles: {
        bgImage: {
            className: 'px-1'
        },
        button: {
            className: `btn-primary flex-none self-center flex items-center justify-center h-8 w-8 p-0 opacity-70 z-10${
                isHoverSupported ? ' invisible group-hover:visible' : emptyString
            }`
        },
        buttonAtFirst: {
            className: 'hidden'
        },
        buttonAtLast: {
            className: 'hidden'
        },
        container: {
            className: 'group flex h-auto -mx-1 mt-4'
        },
        image: {
            className: 'border-2 border-transparent cursor-pointer box-border rounded-sm',
            style: rectStyles.centeredImage,
        },
        imageSelected: {
            className: '!border-green-500 dark:!border-pink-400 !cursor-default'
        },
        imagesBox: {
           className: 'flex-1 -mx-9 overflow-x-hidden'
        },
        imagesBoxAtFirst: {
            className: 'ml-0'
        },
        imagesBoxAtLast: {
            className: 'mr-0'
        },
    }
});

export default ImageSlider;