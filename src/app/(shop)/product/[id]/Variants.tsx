'use client';
/** 
 * https://github.com/atmulyana/nextCart
 **/
import React from 'react';
import type {TVariant} from '@/data/types';
import config from '@/config/usable-on-client';
import Select from '@/components/SubmittedSelect';
import {currencySymbol, formatAmount} from '@/lib/common';

function selectImage(imgIdx: number) {
    if (!isNaN(imgIdx)) {
        (document
            .querySelector<HTMLElement>('.image-slider-thumbnails :nth-child(' + (imgIdx + 1) + ')')
            ?.children[0] as HTMLElement
        ).click();
    }
}

const Variants = React.memo(function Variants({labels: {option, outOfStock}, stockDisabled = false, items}: {
    labels: {
        option: string,
        outOfStock: string,
    },
    stockDisabled?: boolean
    items: TVariant[]
}) {
    const [price, setPrice] = React.useState(items[0].price);
    const [stock, setStock] = React.useState(items[0].stock ?? 0);

    React.useEffect(() => {
        selectImage(items[0].imageIdx ?? NaN);
    //eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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
                selectImage(imgIdx);
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