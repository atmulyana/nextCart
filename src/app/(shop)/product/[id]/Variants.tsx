'use client';
/** 
 * https://github.com/atmulyana/nextCart
 **/
import React from 'react';
import {emptyArray} from 'javascript-common';
import type {RefInstance as SliderRef} from '@react-packages/simple-images-slider';
import type {TVariant} from '@/data/types';
import config from '@/config/usable-on-client';
import Select from '@/components/SubmittedSelect';
import {currencySymbol, formatAmount} from '@/lib/common';

const Variants = React.memo(function Variants({
    labels: {option, outOfStock},
    stockDisabled = false,
    items,
    sliderRef,
}: {
    labels: {
        option: string,
        outOfStock: string,
    },
    stockDisabled?: boolean
    items: TVariant[],
    sliderRef: React.RefObject<SliderRef | null>,
}) {
    const [price, setPrice] = React.useState(items[0].price);
    const [stock, setStock] = React.useState(items[0].stock ?? 0);

    React.useEffect(() => {
        if (sliderRef.current && items[0].imageIdx !== undefined) sliderRef.current.selectedIndex = items[0].imageIdx;
    //eslint-disable-next-line react-hooks/exhaustive-deps
    }, emptyArray);

    return <>
        <h5 className='w-full mb-2.5 text-neutral-500 text-[1.33rem]'>
            {currencySymbol()}{formatAmount(price)}
        </h5>
        <h5 className='w-full'>{option}</h5>
        <Select id='productVariant' name='productVariant' noValidation className='mb-2.5'
            onChange={e => {
                const selectedOpt = e.target.querySelector('option:checked'),
                      imgIdx = parseInt(selectedOpt?.getAttribute('data-image-idx') as any),
                      price = parseFloat(selectedOpt?.getAttribute('data-price') ?? '0'),
                      stock = parseFloat(selectedOpt?.getAttribute('data-stock') ?? '0');
                setPrice(price);
                setStock(stock);
                if (sliderRef.current) sliderRef.current.selectedIndex = imgIdx;
            }}
        >
            {items.map(v => <option
                key={v._id.toString()}
                value={v._id.toString()}
                data-image-idx={v.imageIdx}
                data-price={v.price}
                data-stock={v.stock}
            >{v.title}</option>)}
        </Select>
        {config.trackStock && !stockDisabled && stock < 1 && <h5 className='w-full mb-2.5 text-center text-red-500'>{outOfStock}</h5>}
    </>;
});
export default Variants;