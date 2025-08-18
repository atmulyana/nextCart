/** 
 * https://github.com/atmulyana/nextCart
 **/
import React from 'react';
import GoBackButton from '@/components/GoBackButton';
import Select from '@/components/SubmittedSelect';
import TextArea from '@/components/SubmittedTextArea';
import Template from '@/components/partials/Template';
import config from '@/config';
import lang from '@/data/lang';
import {OrderStatusMap, type OrderStatus} from '@/data/types';
import {fnMeta} from '@/lib/common';
import Cart from './Cart';
import CustomerData from './CustomerData';
import Form from './Form';

export const generateMetadata = fnMeta(async () => {
    return {
        title: `${config.cartTitle}: ${lang('Create order')}`,
    };
});

export default async function CreateOrder() {
    return <Template>
        <div className='flex pb-5'>
            <h2 className='flex-1'>{lang('Create order')}</h2>
            <div id='createOrderButtonContainer' className='ml-4'></div>
            <GoBackButton className='ml-4' label={lang('Go Back')} />
        </div>
        <div className='flex gap-4'>
            <div className='basis-1/2'>
                <Form saveLabel={lang('Save')}>
                    <div className='mb-4'>
                        <label>{lang('Order status')}</label>
                        <Select name='status' value='Pending'>
                            {Object.keys(OrderStatusMap).map(status => {
                                if (OrderStatusMap[status as OrderStatus]) {
                                    return <option key={status} value={status}>{lang(status)}</option>
                                }
                                return null;
                            })}
                        </Select>
                    </div>
                    <CustomerData texts={{
                        address1: lang('Address 1'),
                        address2: lang('Address 2'),
                        company: lang('Company name'),
                        country: lang('Country'),
                        email: lang('Email address'),
                        find: lang('Find'),
                        firstName: lang('First name'),
                        lastName: lang('Last name'),
                        state: lang('State'),
                        optional: lang('optional'),
                        phone: lang('Phone number'),
                        postcode: lang('Post code'),
                        selectCountry: lang('Select Country'),
                    }} />
                    <div className='mb-4'>
                        <TextArea name='orderComment' placeholder={lang("Order comment")} />
                    </div>
                </Form>
            </div>
            <div className='basis-1/2'>
                <Cart
                    title={lang('Cart contents')}
                    emptyText={lang('Empty cart')}
                    optionText={lang('Option')}
                    qtyText={lang('Quantity')}
                    discountText={lang('Discount')}
                    totalText={lang('Total')}

                    addProductsText={lang('Add some products')}
                    hereText={lang('here')}
                    comeBackText={lang('then come back to complete the order')}
                />
            </div>
        </div>
    </Template>;
}