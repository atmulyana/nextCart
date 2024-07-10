'use client';
/** 
 * https://github.com/atmulyana/nextCart
 **/
import React from 'react';
import {usePathname} from 'next/navigation';
import {Cart, CartButtons} from '@/components/Cart';

export default React.memo(function CheckoutCart({
    checkoutText,
    clearCartText,
    ...props
}: {
    title: string,
    optionText: string,
    discountText: string,
    totalText: string,
    emptyText: string,
    qtyText: string,
    checkoutText: string,
    clearCartText: string,
}) {
    const path = usePathname();
    const isReadOnly = ['/checkout/shipping', '/checkout/payment'].includes(path);

    return <>
        <Cart {...props} readonly={isReadOnly} homeAfterClear />
        {!isReadOnly && <CartButtons {...{checkoutText, clearCartText}} homeAfterClear />}
    </>;
});