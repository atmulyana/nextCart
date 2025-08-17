'use client';
/** 
 * https://github.com/atmulyana/nextCart
 **/
import React from 'react';
import { Cart as CartContent, useCart } from '@/components/Cart';

export default function Cart({
    addProductsText,
    comeBackText,
    hereText,
    ...props
}: {
    addProductsText: string,
    comeBackText: string,
    discountText: string,
    emptyText: string,
    hereText: string,
    optionText: string,
    qtyText: string,
    title: string,
    totalText: string,
}) {
    const cart = useCart();
    const isCartEmpty = Object.keys(cart.items).length < 1;
    return <div className={`${isCartEmpty
        ? 'bg-yellow-100 dark:bg-yellow-900 text-[var(--color-warning)] p-4 flex flex-col items-center'
        : 'bg-transparent'
        }`}>
        <CartContent {...props} noBorder />
        {isCartEmpty && <div className="self-stretch text-center mt-8">
            {addProductsText}&nbsp;
            <a target="_blank" href="/"><strong>{hereText}</strong></a>&nbsp;
            {comeBackText}.
        </div>}
    </div>;
}