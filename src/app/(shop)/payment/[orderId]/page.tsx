/** 
 * https://github.com/atmulyana/nextCart
 **/
import React from 'react';
import Link from 'next/link';
import {notFound} from 'next/navigation';
import lang from '@/data/lang';
import {getOrder} from '@/data/order';
import {getPaymentModule} from '@/lib/payments';
import Template from '@/subview/partials/Template';

export function generateMetadata() {
    return {
        title: lang('Payment completed'),
    };
};

export default async function Payment({params: {orderId}}: {params: {orderId: string}}) {
    const order = await getOrder(orderId);
    if (!order) return notFound();
    const module = await getPaymentModule(order.orderPaymentGateway.toLowerCase());
    
    return <Template>{module.PaymentComplete ? (
        <module.PaymentComplete order={order} />
    ) : (    
        <div className='shrink-0 basis-full md:basis-5/6 mx-auto text-center pt-14'>
            {order.orderStatus == 'Paid' ?
                <h2 className="text-[--color-success]">{lang('Your payment has been successfully processed')}</h2> :
             order.orderStatus == 'Pending' ?
                (
                    order.orderPaymentGateway.toLowerCase() == 'instore' ?
                        <h2 className="text-[--color-warning]">{module.config.resultMessage.toString()}</h2> :
                        <h2 className="text-[--color-warning]">{lang('The payment for this order is pending. We will be in contact shortly.')}</h2>
                ) :
                <h2 className="text-[--color-danger]">{lang('Your payment has failed. Please try again or contact us.')}</h2>
            }
            <div>
                <p><strong>{lang("Order ID")}:</strong> {order._id.toString()}</p>
                <p><strong>{lang("Payment ID")}:</strong> {order.orderPaymentId}</p>
            </div>
            {(order.orderStatus === 'Paid' || order.orderStatus === 'Pending') &&
               <h5 className="text-[--color-warning]">{lang('Please retain the details above as a reference of payment')}</h5>
            }
            <Link href='/' className='btn btn-outline-warning'>{lang('Home')}</Link>
        </div>
    )}</Template>;
}