/** 
 * https://github.com/atmulyana/nextCart
 **/
import React from 'react';
import Link from 'next/link';
import lang from '@/data/lang';
import {getOrdersByCustomerId} from '@/data/order';
import {getSession} from '@/data/session';
import Breadcrumb from '@/subview/components/Breadcrumb';
import FormWithSchema from '@/subview/components/FormWithSchema';
import Button from '@/subview/components/SubmitButton';
import CustomerDataForm from '@/subview/partials/CustomerDataForm';
import Template from '@/subview/partials/Template';
import {POST} from '../update/route';
import Orders from './Orders';

export function generateMetadata() {
    return {
        title: lang('Orders'),
    };
};

export default async function CustomerAccount() {
    const session = await getSession();
    const orders = await getOrdersByCustomerId(session.customerId);
    for (let order of orders.list) {
        order._id = order._id.toString();
        if (typeof(order.orderPaymentId) == 'object') order.orderPaymentId = (order.orderPaymentId as Object).toString();
        delete order.orderCustomer;
        for (let id in order.orderProducts) {
            const p = order.orderProducts[id];
            p.productId = p.productId.toString();
            if (p.variantId) p.variantId = p.variantId.toString();
        }
    }

    return <Template>
        <div className='basis-full md:basis-5/6 mx-auto'>
            <Breadcrumb
                homeText={lang('Home')}
                items={[
                    {
                        text: lang('Orders'),
                        path: '/customer/account',
                    },
                ]}
            />
            <div className='flex flex-wrap justify-center -mx-4'>
                <div className='basis-full md:basis-5/12 shrink-0 px-4'>
                    <div className='bordered'>
                        <h5 className='mb-4'>{lang('Customer details')}</h5>
                        <FormWithSchema 
                            id='customerInfoForm'
                            action={async function(formData: FormData) {
                                'use server';
                                return POST.responseJson(formData);
                            }}
                            className='block'
                            schemaName='checkoutInfo'
                        >
                            <input type='hidden' name='customerId' value={session.customerId?.toHexString() || ''} />
                            <CustomerDataForm data={session} />
                            <Button className='btn-primary'>{lang('Save details')}</Button>
                        </FormWithSchema>
                    </div>
                </div>
                <div className='basis-full md:basis-7/12 shrink-0 px-4'>
                    <div className='bordered'>
                        <h5 className='mb-4'>{lang('Orders')}</h5>
                        {orders.list.length < 1 ? (
                            <div className='bordered'>
                                {lang('There are no orders for this account')}.&nbsp;
                                <Link href='/' className='text-[--color-success]'>{lang('Order here')}</Link>
                            </div>
                        ) : (
                            <Orders
                                orders={orders}
                                text={{
                                    id: lang('Order ID'),
                                    date: lang('Date'),
                                    view: lang('View'),
                                    close: lang('Close'),
                                    status: lang('Order status'),
                                    statuses: {
                                        Paid: lang('Paid'),
                                        Approved: lang('Approved'),
                                        'Approved - Processing': `${lang('Approved')} - ${lang('Processing')}`,
                                        Declined: lang('Declined'),
                                        Failed: lang('Failed'),
                                        Completed: lang('Completed'),
                                        Shipped: lang('Shipped'),
                                        Pending: lang('Pending'),
                                    },
                                    expectedBTC: lang('Order Expected BTC'),
                                    receivedBTC: lang('Order Received BTC'),
                                    bcTxId: lang('Order Blockonomics Txid'),
                                    netAmout: lang('Order net amount'),
                                    shippingAmount: lang('Order shipping amount'),
                                    totalAmount: lang('Order total amount'),
                                    email: lang('Email address'),
                                    company: lang('Company'),
                                    firstName: lang('First name'),
                                    lastName: lang('Last name'),
                                    address1: lang('Address 1'),
                                    address2: lang('Address 2'),
                                    country: lang('Country'),
                                    state: lang('State'),
                                    postcode: lang('Post code'),
                                    phone: lang('Phone number'),
                                    products: lang('Products ordered'),
                                    options: lang('Option'),
                                    comment: lang('Comment'),
                                }}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    </Template>;
}