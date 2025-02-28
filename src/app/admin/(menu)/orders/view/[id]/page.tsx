/** 
 * https://github.com/atmulyana/nextCart
 **/
import React from 'react';
import {headers} from 'next/headers';
import {notFound} from 'next/navigation';
import config from '@/config';
import lang from '@/data/lang';
import {getOrder} from '@/data/order';
import {awaitProps, currencySymbol, fnMeta, formatAmount, getStatusColor} from '@/lib/common';
import {formatDate} from '@/lib/datetime/server';
import Form from '@/subview/components/Form';
import DeleteButton from '@/subview/components/DeleteButton';
import GoBackButton from '@/subview/components/GoBackButton';
import SubmitButton from '@/subview/components/SubmitButton';
import Select from '@/subview/components/SubmittedSelect';
import Template from '@/subview/partials/Template';
import {remove, updateStatus} from '../../actions';
import {getStatusOptions, getStatusText} from '../../common';

export const generateMetadata = fnMeta(async () => {
    return {
        title: `${config.cartTitle}: ${lang('View order')}`,
    };
});

export default async function ViewOrder(props: {params: Promise<{id: string}>}) {
    const {params: {id}} = await awaitProps(props);
    const order = await getOrder(id);
    if (!order) return notFound();
    return <Template>
        <div className='flex items-baseline pb-5'>
            <h2 className='flex-auto'>{lang('View order')}</h2>
            <Form action={updateStatus} className='flex' refreshThreshold='success'>
                <input type='hidden' name='id' value={id} />
                <Select name="status" value={order.orderStatus} className='ml-4'>
                    {getStatusOptions().map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </Select>
                <SubmitButton className='btn-outline-success ml-4'>{lang('Update status')}</SubmitButton>
            </Form>
            <Form action={remove}>
                <input type='hidden' name='id' value={id} />
                <input type='hidden' name='redirectUrl' value={(await headers()).get('next-url') || '/admin/orders'} />
                <DeleteButton
                    className='btn-outline-danger ml-4'
                    question={lang('Are you sure you want to delete this order?')}
                >{lang('Delete')}</DeleteButton>
            </Form>
            <GoBackButton className='ml-4' label={lang('Go Back')} />
        </div>
        <ul className='bordered'>
            <li className='bg-[--bg-color]'>
                <strong>{lang('Order status')}:</strong>
                <span className='float-right' style={{color:`var(--color-${getStatusColor(order.orderStatus)})`}}>
                    {getStatusText(order.orderStatus)}
                </span>
            </li>
            <li className='bg-[--bg-color]'>
                <strong>{lang('Date')}:</strong>
                <span className='float-right'>{formatDate(order.orderDate)}</span>
            </li>
            <li className='bg-[--bg-color]'>
                <strong>{lang('Order ID')}:</strong>
                <span className='float-right'>{order._id.toString()}</span>
            </li>
            <li className='bg-[--bg-color]'>
                <strong>{lang('Payment Gateway ref')}:</strong>
                <span className='float-right'>{order.orderPaymentId.toString()}</span>
            </li>
            <li className='bg-[--bg-color]'>
                <strong>{lang('Payment Gateway')}:</strong>
                <span className='float-right'>{order.orderPaymentGateway}</span>
            </li>
            {order.orderExpectedBtc && <li className='bg-[--bg-color]'>
                <strong>{lang('Order Expected BTC')}:</strong>
                <span className="float-right">{order.orderExpectedBtc}</span>
            </li>}
            {order.orderReceivedBtc && <li className='bg-[--bg-color]'>
                <strong>{lang('Order Received BTC')}:</strong>
                <span className="float-right">{order.orderReceivedBtc}</span>
            </li>}
            {order.orderBlockonomicsTxid && <li className='bg-[--bg-color]'>
                <strong>{lang('Order Blockonomics Txid')}:</strong>
                <span className="float-right">{order.orderBlockonomicsTxid}</span>
            </li>}
            {order.orderPaymentMessage && <li className='bg-[--bg-color]'>
                <strong>{lang('Payment Message')}:</strong>
                <span className="float-right">{order.orderPaymentMessage}</span>
            </li>}
            <li className='bg-[--bg-color]'>
                <strong>{lang('Order net amount')}:</strong>
                <span className='float-right'>{currencySymbol()}{formatAmount(order.orderTotal - order.orderShipping)}</span>
            </li>
            <li className='bg-[--bg-color]'>
                <strong>{lang('Order shipping amount')}:</strong>
                <span className='float-right'>{currencySymbol()}{formatAmount(order.orderShipping)}</span>
            </li>
            <li className='bg-[--bg-color]'>
                <strong>{lang('Order total amount')}:</strong>
                <span className='float-right'>{currencySymbol()}{formatAmount(order.orderTotal)}</span>
            </li>
            <li className='bg-[--bg-color]'>
                <strong>{lang('Email address')}:</strong>
                <span className='float-right'>{order.orderEmail}</span>
            </li>
            <li className='bg-[--bg-color]'>
                <strong>{lang('Company')}:</strong>
                <span className='float-right'>{order.orderCompany}</span>
            </li>
            <li className='bg-[--bg-color]'>
                <strong>{lang('First name')}:</strong>
                <span className='float-right'>{order.orderFirstname}</span>
            </li>
            <li className='bg-[--bg-color]'>
                <strong>{lang('Last name')}:</strong>
                <span className='float-right'>{order.orderLastname}</span>
            </li>
            <li className='bg-[--bg-color]'>
                <strong>{lang('Address 1')}:</strong>
                <span className='float-right'>{order.orderAddr1}</span>
            </li>
            <li className='bg-[--bg-color]'>
                <strong>{lang('Address 2')}:</strong>
                <span className='float-right'>{order.orderAddr2}</span>
            </li>
            <li className='bg-[--bg-color]'>
                <strong>{lang('Country')}:</strong>
                <span className='float-right'>{order.orderCountry}</span>
            </li>
            <li className='bg-[--bg-color]'>
                <strong>{lang('State')}:</strong>
                <span className='float-right'>{order.orderState}</span>
            </li>
            <li className='bg-[--bg-color]'>
                <strong>{lang('Post code')}:</strong>
                <span className='float-right'>{order.orderPostcode}</span>
            </li>
            <li className='bg-[--bg-color]'>
                <strong>{lang('Phone number')}:</strong>
                <span className='float-right'>{order.orderPhoneNumber}</span>
            </li>
            <li className='bg-[--bg-color]'>
                <strong>{lang('Order type')}:</strong>
                <span className='float-right'>{order.orderType}</span>
            </li>
            <li className='bg-[--bg-color]'>
                <strong>{lang('Comment')}:</strong>
                <span className='float-right'>{order.orderComment}</span>
            </li>

            <li className='bg-[--bg-color]'>&nbsp;</li>
            <li className='bg-[--bg-color] text-blue-500'>{lang('Products ordered')}</li>
            {Object.values(order.orderProducts).map((p, i) => 
            <li key={i} className='bg-[--bg-color]'>
                {p.quantity} x {p.title}
                {p.variantId && <>
                    &nbsp; &gt; &nbsp;
                    <span className="text-[--color-warning]">{lang('Option')}:&nbsp;</span>
                    {p.variantTitle}
                </>}
                <div className="float-right">{currencySymbol()}{formatAmount(p.totalItemPrice)}</div>
                {p.productComment && <h4 className='text-[--color-danger]'>{p.productComment}</h4>}
            </li>)}
        </ul>
    </Template>;
}