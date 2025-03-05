/** 
 * https://github.com/atmulyana/nextCart
 **/
import React from 'react';
import Link from 'next/link';
import type {TOrder} from '@/data/types';
import lang from '@/data/lang';

export default function BlockonomicsPayment({order}: {order: TOrder}) {
    return <div className='shrink-0 basis-full md:basis-5/6 mx-auto text-center pt-14'>
        <h2 className="text-[--color-success]">{`${lang('Thank you')}. ${lang('The order has been received')}.`}</h2>
        <div>
            <p><h5>{`${lang('The order will be be processed upon confirmation by the bitcoin network')}.
                ${lang('Please keep below order details for reference')}.`}</h5></p>
            <p><strong>{lang("Order ID")}:</strong> {order._id.toString()}</p>
            <p><strong>{lang("Payment ID")}:</strong> {order.orderPaymentId.toString()}</p>
        </div>
        <Link href='/' className='btn btn-outline-warning'>{lang('Home')}</Link>
    </div>;
}