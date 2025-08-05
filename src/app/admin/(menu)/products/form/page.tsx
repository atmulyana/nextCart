/** 
 * https://github.com/atmulyana/nextCart
 **/
import React from 'react';
import config from '@/config';
import lang from '@/data/lang';
import {currencySymbol, fnMeta} from '@/lib/common';
import Form from '@/components/FormWithSchema';
import HtmlEditor from '@/components/HtmlEditor';
import Keywords from '@/components/Keywords';
import Button from '@/components/SubmitButton';
import CheckBox from '@/components/SubmittedCheckBox';
import Input from '@/components/SubmittedInput';
import Select from '@/components/SubmittedSelect';
import ValidatedInput from '@/components/ValidatedInput';
import Template from '@/components/partials/Template';
import {save} from '../actions';
import PermalinkInput from '../PermalinkInput';

export const generateMetadata = fnMeta(async () => {
    return {
        title: `${config.cartTitle}: ${lang('New product')}`,
    };
});

export default async function AdminProduct() {
    
    return <Template>
    <Form schemaName='newProduct' action={save}>
        <div className='flex mx-4 pb-1'>
            <h2 className='flex-1'>{lang('New product')}</h2>
            <Button className='btn-outline-success flex-none'>{lang('Save product')}</Button>
        </div>
        <div className='mb-4 mx-4'>
            <label htmlFor='productTitle'>{lang('Product title')}&nbsp;*</label>
            <Input type='text' id='productTitle' name='title' />
        </div>
        <div className='flex flex-wrap items-start mb-4'>
            <div className='grow-0 shrink-0 basis-full sm:basis-1/3 px-4'>
                <label htmlFor='productPrice'>{lang('Product price')}&nbsp;*</label>
                <ValidatedInput className='rounded-l-none z-[1]' id='productPrice' name='price' type='number'
                    prepend={
                        <label className='flex align-middle text-center items-center justify-center px-3 py-1.5 -mr-px text-base
                            border rounded-sm rounded-r-none text-gray-600 dark:text-gray-400 bg-gray-200 dark:bg-gray-800
                            border-gray-300 dark:border-gray-700'
                        >
                            {currencySymbol()}
                        </label>
                    }
                />
            </div>
            <div className='grow-0 shrink-0 basis-full sm:basis-1/3 px-4'>
                <label htmlFor='productGtin'>{lang('Product GTIN')}</label>
                <Input id='productGtin' name='gtin' />
                <div className='text-gray-400 dark:text-gray-600'>{lang('The Serial number, GTIN or Barcode')}</div>
            </div>
            <div className='grow-0 shrink-0 basis-full sm:basis-1/3 px-4'>
                <label htmlFor='productBrand'>{lang('Product brand')}</label>
                <Input id='productBrand' name='brand' />
            </div>
        </div>
        <div className='flex mb-4'>
            <div className='flex flex-col grow-0 shrink-0 basis-full sm:basis-1/3 px-4'>
                <label htmlFor='productPublished'>{lang('Status')}</label>
                <Select id='productPublished' name='published'>
                    <option value='true'>{lang('Published')}</option>
                    <option value='false'>{lang('Draft')}</option>
                </Select>
            </div>
            {config.trackStock && <>
            <div className='flex flex-col grow-0 shrink-0 basis-full sm:basis-1/3 px-4'>
                <label htmlFor='productStock'>{lang('Stock level')}</label>
                <Input id='productStock' name='stock' type='number' />
            </div>
            <div className='flex flex-col grow-0 shrink-0 basis-full sm:basis-1/3 px-4'>
                <label htmlFor='productStockDisable'>{lang('Disable stock tracking')}</label>
                <div className='form-input flex items-center bg-transparent border-transparent pl-0 border-l-0 align-middle'>
                    <CheckBox id='productStockDisable' name='stockDisable' noIndeterminate className='self-start' />
                </div>
            </div>
            </>}
        </div>
        <div className='mb-4 mx-4'>
            <label>{lang('Product description')}&nbsp;*</label>
            <HtmlEditor name='description' rows={10} />
        </div>
        <div className='mb-4 mx-4'>
            <label htmlFor='productPermalink'>{lang('Permalink')}</label>
            <PermalinkInput placeholder={lang('Permalink for the product')} validateLabel={lang('Validate')} />
            <div className='text-gray-400 dark:text-gray-600'>{lang('This sets a readable URL for the product')}</div>
        </div>
        {config.paymentGateway.includes('stripe') && <div className='mb-4 mx-4'>
            <label htmlFor='productSubscription'>{lang('Subscription plan')}</label>
            <Input type='text' id='productSubscription' name='subscription' placeholder='plan_XXXXXXXXXXXXXX' />
            <div className='text-gray-400 dark:text-gray-600'>
                {lang('First setup the plan in "Stripe" dashboard and enter the Plan ID. Format: plan_XXXXXXXXXXXXXX')}
            </div>
        </div>}
        <div className='mb-4 mx-4'>
            <label htmlFor='productComment'>{lang('Allow comment')}</label>
            <CheckBox id='productComment' name='allowComment' className='self-start' noIndeterminate />
            <div className='text-gray-400 dark:text-gray-600'>
                {lang('Allow free form comments when adding products to cart')}
            </div>
        </div>
        <div className='mb-4 mx-4'>
            <label htmlFor='productTags'>{lang('Product tag words')}</label>
            <Keywords name='tags' />
            <div className='text-gray-400 dark:text-gray-600'>
                {lang('Tag words used to indexed products, making them easier to find and filter.')}
            </div>
        </div>
    </Form>
    </Template>;
}