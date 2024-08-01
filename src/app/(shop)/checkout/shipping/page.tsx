/** 
 * https://github.com/atmulyana/nextCart
 **/
import React from 'react';
import Link from 'next/link';
import lang from '@/data/lang';
import {getCart, upsertCart} from '@/data/cart';
import {getSession} from '@/data/session';
import {currencySymbol, formatAmount} from '@/lib/common';
import {updateTotalCart} from '@/lib/cart';
import Template from '@/partials/Template';

export function generateMetadata() {
    return {
        title: `${lang('Checkout')} - ${lang('Shipping')}`,
    };
};

export async function updateShippingInCart() {
    const cart = await getCart();
    const session = await getSession()
    if (cart) {
        updateTotalCart(cart, session);
        await upsertCart(cart._id, cart);
    }
    return cart;
}

export default async function CheckoutShipping() {
    const cart = await updateShippingInCart();
    const shippingCost = cart?.totalCartShipping ?? 0;
    
    return <Template>
        <div className='bordered'>
            <h5 className='mb-3'>{lang('Shipping options')}</h5>
            <ul className='flex flex-col bordered !p-0'>
                <li className='block px-5 py-3'>
                    {lang(cart?.shippingMessage ?? '')}
                    {shippingCost > 0 && <strong className='float-right'>{currencySymbol()}{formatAmount(cart?.totalCartShipping ?? 0)}</strong>}
                </li>
            </ul>
        </div>
        <div className='checkout-buttons'>
            <Link href='/checkout/information' className='btn btn-primary'>{lang('Return to information')}</Link> 
            <Link href='/checkout/payment' className='btn btn-primary'>{lang('Proceed to payment')}</Link>
        </div>
    </Template>;
}