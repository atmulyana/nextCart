/** 
 * https://github.com/atmulyana/nextCart
 **/
import React from 'react';
import {notFound} from 'next/navigation';
import JsSimpleDateFormat from 'jssimpledateformat';
import config from '@/config';
import lang from '@/data/lang';
import {getDiscount} from '@/data/discount';
import {TDiscount} from '@/data/types';
import {awaitProps, fnMeta} from '@/lib/common';
import Form from '@/components/FormWithSchema';
import GoBackButton from '@/components/GoBackButton';
import Button from '@/components/SubmitButton';
import DeleteButton from '@/components/DeleteButtonWithLoading';
import Input from '@/components/SubmittedInput';
import Select from '@/components/SubmittedSelect';
import Template from '@/components/partials/Template';
import {erase, save} from '../actions';

export const generateMetadata = fnMeta<{id?: string}>(async ({params: {id}}) => {
    return {
        title: `${config.cartTitle}: ${id ? lang('Edit discount') : lang('New discount')}`,
    };
});

export default async function DiscountForm(props: {params: Promise<{id?: string}>}) {
    const {params: {id}} = await awaitProps(props);
    let discount: TDiscount | undefined | null;
    if (id) {
        discount = await getDiscount(id);
        if (!discount) return notFound();
    }

    const dtFormat = new JsSimpleDateFormat('yyyy-MM-ddTHH:mm');

    return <Template>
    <Form schemaName='discount' action={save}>
        <div className='flex mx-4 pb-5'>
            <h2 className='flex-1'>{lang(discount ? 'Edit discount' : 'New discount')}</h2>
            <Button className='btn-outline-success flex-none ml-4'>{lang('Save')}</Button>
            {id && <DeleteButton
                action={async function() {
                    'use server';
                    return erase(id);
                }}
                deleteLabel={lang('Delete')}
                question={lang('Are you sure you want to proceed?')}
            />}
            <GoBackButton className='ml-4' label={lang('Go Back')} backUrl='/admin/settings/discounts' />
        </div>
        {id && <input type='hidden' id='productId' name='id' value={id} />}
        <div className='mb-4 mx-4'>
            <label htmlFor='discountCode'>{lang('Code')}&nbsp;*</label>
            <Input type='text' id='discountCode' name='code' value={discount?.code} />
        </div>
        <div className='mb-4 mx-4'>
            <label>{lang('Amount')}&nbsp;*</label>
            <div className='flex flex-wrap -mx-4'>
                <div className='flex items-center basis-full sm:basis-1/2 shrink-0 px-4'>
                    <label htmlFor='discountType' className='mr-4'>{lang('Type')}:</label>
                    <Select id='discountType' name='type' value={discount?.type} containerClass='flex-1'>
                        <option value='amount'>{lang('Amount')}</option>
                        <option value='percent'>{lang('Percent')}</option>
                    </Select>
                </div>
                <div className='flex items-center basis-full sm:basis-1/2 shrink-0 px-4'>
                    <label htmlFor='discountValue' className='mr-4'>{lang('Value')}:</label>
                    <Input type='text' id='discountValue' name='value' value={discount?.value.toString()} containerClass='flex-1' />
                </div>
            </div>
        </div>
        <div className='mb-4 mx-4'>
            <label>{lang('Validity period')}&nbsp;*</label>
            <div className='flex flex-wrap -mx-4'>
                <div className='flex items-center basis-full sm:basis-1/2 shrink-0 px-4'>
                    <label htmlFor='discountStart' className='mr-4'>{lang('Start')}:</label>
                    <Input type='datetime-local' id='discountStart' name='start'
                        value={discount?.start && dtFormat.format(discount.start)} containerClass='flex-1' />
                </div>
                <div className='flex items-center basis-full sm:basis-1/2 shrink-0 px-4'>
                    <label htmlFor='discountEnd' className='mr-4'>{lang('End')}:</label>
                    <Input type='datetime-local' id='discountEnd' name='end'
                        value={discount?.end && dtFormat.format(discount.end)} containerClass='flex-1' />
                </div>
            </div>
        </div>
    </Form>
    </Template>;
}