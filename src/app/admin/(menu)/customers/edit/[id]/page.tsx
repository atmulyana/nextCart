/** 
 * https://github.com/atmulyana/nextCart
 **/
import React from 'react';
import {notFound} from 'next/navigation';
import config from '@/config';
import lang from '@/data/lang';
import {getCustomer} from '@/data/customer';
import {awaitProps, fnMeta} from '@/lib/common';
import {formatDate} from '@/lib/datetime/server';
import Form from '@/components/FormWithSchema';
import GoBackButton from '@/components/GoBackButton';
import Input from '@/components/SubmittedInput';
import UpdateButton from '@/components/SubmitButton';
import CustomerDataForm from '@/components/partials/CustomerDataForm';
import Template from '@/components/partials/Template';
import DeleteForm from './DeleteForm';
import {save} from '../../actions';

export const generateMetadata = fnMeta(async () => {
    return {
        title: `${config.cartTitle}: ${lang('Edit customer')}`,
    };
});

export default async function EditCustomer(props: {params: Promise<{id: string}>}) {
    const {params: {id}} = await awaitProps(props);
    const customer = await getCustomer(id);
    if (!customer) return notFound();
    return <Template>
        <div id='deleteCustomerFormContainer' className='hidden'></div>
        <Form id='editCustomerForm' action={save} schemaName='editCustomer' className='block'>
            <input type='hidden' name='id' value={id} />
            
            <div className='flex items-baseline pb-5'>
                <h2 className='flex-auto'>{lang('Edit customer')}</h2>
                <UpdateButton className='btn-outline-success ml-4'>{lang('Save')}</UpdateButton>
                <DeleteForm id={id} deleteLabel={lang('Delete')} question={lang('Are you sure you want to delete this customer?')} />
                <GoBackButton className='ml-4' label={lang('Go Back')} />
            </div>

            <CustomerDataForm data={customer} labeled />
            <div className='flex flex-col mb-4'>
                <label htmlFor='customerPassword'>{lang('Password')}</label>
                <Input name='password' id='customerPassword' type='password' />
                <div className='text-gray-500'>{lang('Only populate if wanting to reset the customers password')}</div>
            </div>
            <div className='flex flex-col mb-4'>
                <label htmlFor='customerCreateDate'>{lang('Creation date')}</label>
                <input id='customerCreateDate' defaultValue={customer.created && formatDate(customer.created)} readOnly />
            </div>
        </Form>
    </Template>;
}