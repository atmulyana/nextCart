/** 
 * https://github.com/atmulyana/nextCart
 **/
import React from 'react';
import lang from '@/data/lang';
import {Cart, CartButtons, CartOverlay, CloseCartButton} from '@/components/Cart';

export default function SideCart() {
    return <>
        <CartOverlay />
        <div id="cart" className="flex flex-col items-stretch max-w-full px-4 pt-2 pushy pushy-right !overflow-hidden">
            <div className="flex-none text-right">
                <CloseCartButton />
            </div>
            <Cart
                title={lang('Cart contents')}
                optionText={lang('Option')}
                emptyText={lang('Empty cart')}
                discountText={lang('Discount')}
                totalText={lang('Total')}
            />
            <CartButtons
                checkoutText={lang('Checkout')}
                clearCartText={lang('Clear cart')}
            />
        </div>
    </>;
}