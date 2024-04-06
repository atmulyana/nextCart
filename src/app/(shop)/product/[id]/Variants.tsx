'use client';
/** 
 * https://github.com/atmulyana/nextCart
 **/
import React from 'react';
import type {TVariant} from '@/data/types';
import config from '@/config/usable-on-client';
import SubmittedSelect from '@/components/SubmittedSelect';
import {currencySymbol, formatAmount} from '@/lib/common';

const Variants = React.memo(function Variants({labels: {option, outOfStock}, stockDisabled = false, items}: {
    labels: {
        option: string,
        outOfStock: string,
    },
    stockDisabled?: boolean
    items: Array<Omit<TVariant, '_id' | 'product'> & {_id: string}>
}) {
    const [price, setPrice] = React.useState(items[0].price);
    const [stock, setStock] = React.useState(items[0].stock);
    return <>
        <h5 className='w-full mb-2.5 text-neutral-500 text-[1.33rem]'>
            {currencySymbol()}{formatAmount(price)}
        </h5>
        <h5 className='w-full'>{option}</h5>
        <SubmittedSelect id='productVariant' name='productVariant' className='mb-2.5'
            onChange={e => {
                const selectedOpt = e.target.querySelector('option:checked'),
                      price = parseFloat(selectedOpt?.getAttribute('data-price') ?? '0'),
                      stock = parseFloat(selectedOpt?.getAttribute('data-stock') ?? '0');
                setPrice(price);
                setStock(stock);
            }}
        >
            {items.map(v => <option key={v._id} value={v._id} data-price={v.price} data-stock={v.stock}>{v.title}</option>)}
        </SubmittedSelect>
        {config.trackStock && !stockDisabled && stock < 1 && <h5 className='w-full mb-2.5 text-center text-red-500'>{outOfStock}</h5>}
    </>;
});
export default Variants;