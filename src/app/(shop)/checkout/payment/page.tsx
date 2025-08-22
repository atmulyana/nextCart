/** 
 * https://github.com/atmulyana/nextCart
 **/
import React from 'react';
import Link from 'next/link';
import lang from '@/data/lang';
import {getCart} from '@/data/cart';
import {getSession} from '@/data/session';
import {currencySymbol, formatAmount} from '@/lib/common';
import modules from '@/lib//modules';
import {getForms} from '@/lib/payments';
import CheckoutTemplate from '../CheckoutTemplate';
import DiscountForm from './DiscountForm';

export function generateMetadata() {
    return {
        title: `${lang('Checkout', 1)} - ${lang('Payment')}`,
    };
};

export default async function CheckoutPayment() {
    const cart = await getCart();
    const session = await getSession();
    const forms = await getForms();
    return <CheckoutTemplate>
        <div className='bordered'>
            <h5 className='mb-3'>{lang("Customer details")}</h5>
            <div className='bordered !py-3'>
                {session.customerFirstname} {session.customerLastname} - {session.customerEmail}
                <Link className='float-right' href='/checkout/information'>{lang('Change')}</Link>
            </div>
            <div className='bordered !py-3'>
                {(cart?.totalCartShipping ?? 0) > 0 ? (
                    <div className='flex'>
                        <div className='basis-full md:basis-1/2 flex-none'>{lang(cart?.shippingMessage ?? '')}</div>
                        <div className='basis-full md:basis-1/2 flex-none'>
                            <strong>{currencySymbol()}{formatAmount(cart?.totalCartShipping ?? 0)}</strong>
                            <Link href='/checkout/shipping' className='float-right'>{lang('Change')}</Link>
                        </div>
                    </div>
                ) : <>
                    {lang(cart?.shippingMessage ?? '')}
                    <Link href='/checkout/shipping' className='float-right'>{lang('Change')}</Link>
                </>}
            </div>
            {modules.discount && <DiscountForm applyTitle={lang('Apply')} discountTitle={lang('Discount code')} />}
            <ul className='bordered !mb-0'>
                {forms.map((form, idx) => <li key={idx}>{form}</li>)}
            </ul>
        </div>
    </CheckoutTemplate>;
}