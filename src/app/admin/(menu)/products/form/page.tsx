/** 
 * https://github.com/atmulyana/nextCart
 **/
import React from 'react';
import {notFound} from 'next/navigation';
import config from '@/config';
import lang from '@/data/lang';
import {getProduct} from '@/data/product';
import {TProduct} from '@/data/types';
import {awaitProps, currencySymbol, fnMeta} from '@/lib/common';
import Form from '@/components/FormWithSchema';
import GoBackButton from '@/components/GoBackButton';
import HtmlEditor from '@/components/HtmlEditor';
import Keywords from '@/components/Keywords';
import Button from '@/components/SubmitButton';
import CheckBox from '@/components/SubmittedCheckBox';
import Input from '@/components/SubmittedInput';
import Select from '@/components/SubmittedSelect';
import ValidatedInput from '@/components/ValidatedInput';
import Template from '@/components/partials/Template';
import {save} from '../actions';
import ImagesVariants from './ImagesVariants';
import PermalinkInput from './PermalinkInput';

export const generateMetadata = fnMeta(async () => {
    return {
        title: `${config.cartTitle}: ${lang('New product')}`,
    };
});

export default async function AdminProduct(props: {params: Promise<{id?: string}>}) {
    const {params: {id}} = await awaitProps(props);
    let product: TProduct | undefined;
    if (id) {
        product = await getProduct(id);
        if (!product) return notFound();
    }

    return <Template>
    <Form schemaName='product' action={save}>
        <div className='flex mx-4 pb-5'>
            <h2 className='flex-1'>{lang(product ? 'Edit product' : 'New product')}</h2>
            <Button className='btn-outline-success flex-none ml-4'>{lang('Save product')}</Button>
            <GoBackButton backUrl='/admin/products' className='ml-4' label={lang('Go Back')} />
        </div>
        {product && <input type='hidden' id='productId' name='id' value={product._id.toString()} />}
        <div className='mb-4 mx-4'>
            <label htmlFor='productTitle'>{lang('Product title')}&nbsp;*</label>
            <Input type='text' id='productTitle' name='title' value={product?.productTitle} />
        </div>
        <div className='flex flex-wrap items-start mb-4'>
            <div className='shrink-0 basis-full sm:basis-1/3 px-4'>
                <label htmlFor='productPrice'>{lang('Product price')}&nbsp;*</label>
                <ValidatedInput className='rounded-l-none z-[1]' id='productPrice' name='price' type='number'
                    value={product?.productPrice.toString()}
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
            <div className='shrink-0 basis-full sm:basis-1/3 px-4'>
                <label htmlFor='productGtin'>{lang('Product GTIN')}</label>
                <Input id='productGtin' name='gtin' value={product?.productGtin} />
                <div className='text-gray-500'>{lang('The Serial number, GTIN or Barcode')}</div>
            </div>
            <div className='shrink-0 basis-full sm:basis-1/3 px-4'>
                <label htmlFor='productBrand'>{lang('Product brand')}</label>
                <Input id='productBrand' name='brand' value={product?.productBrand} />
            </div>
        </div>
        <div className='flex mb-4'>
            <div className='flex flex-col shrink-0 basis-full sm:basis-1/3 px-4'>
                <label htmlFor='productPublished'>{lang('Status')}</label>
                <Select id='productPublished' name='published' value={product?.productPublished?.toString()}>
                    <option value='true'>{lang('Published')}</option>
                    <option value='false'>{lang('Draft')}</option>
                </Select>
            </div>
            {config.trackStock && <>
            <div className='flex flex-col shrink-0 basis-full sm:basis-1/3 px-4'>
                <label htmlFor='productStock'>{lang('Stock level')}</label>
                <Input id='productStock' name='stock' type='number' value={product?.productStock} />
            </div>
            <div className='flex flex-col shrink-0 basis-full sm:basis-1/3 px-4'>
                <label htmlFor='productStockDisable'>{lang('Disable stock tracking')}</label>
                <div className='form-input flex items-center bg-transparent border-transparent pl-0 border-l-0 align-middle'>
                    <CheckBox id='productStockDisable' name='stockDisable' noIndeterminate value={product?.productStockDisable} />
                </div>
            </div>
            </>}
        </div>
        <div className='mb-4 mx-4'>
            <label>{lang('Product description')}&nbsp;*</label>
            <HtmlEditor name='description' rows={10} value={product?.productDescription} />
        </div>
        {product && <ImagesVariants
            imageCount={product.imageCount}
            mainIdx={product.imgaeDefaultIndex ?? 0}
            imageTexts={{
                deleteConfirm: lang('Delete Image'),
                delete: lang('Delete'),
                label: lang('Product images'),
                main: lang('Main image'),
                noImage: lang('No image has been uploaded for this product'),
                popup: {
                    cancel: lang('Cancel'),
                    noFile: lang('No file selected'),
                    selectFile: lang('Select file'),
                    title: lang('Product image upload'),
                    upload: lang('Upload'),
                },
                setMain: lang('Set as main image'),
                upload: lang('Upload image'),
            }}
            productId={product._id.toString()}
            productPrice={product.productPrice}
            variants={product.variants}
            variantTexts={{
                add: lang('Add'),
                delete: lang('Delete'),
                deleteConfirm: lang('Delete Variant'),
                edit: lang('Edit'),
                image: lang('Image'),
                label: lang('Product variants'),
                name: lang('Name'),
                noVariant: lang('No variant yet'),
                popup: {
                    cancel: lang('Cancel'),
                    image: lang('Image number'),
                    imageNote: lang('The image that will shown when the variant is selected in product information page'),
                    name: lang('Name'),
                    nameNote: lang('Shown in the variant dropdown'),
                    price: lang('Price'),
                    save: lang('Save'),
                    stock: lang('Stock level'),
                    title: lang('Product variant'),
                },
                price: lang('Price'),
                stock: lang('Stock level'),
            }}
        />}
        <div className='mb-4 mx-4'>
            <label htmlFor='productComment'>{lang('Allow comment')}</label>
            <CheckBox id='productComment' name='allowComment' noIndeterminate value={product?.productComment} />
            <div className='text-gray-500'>
                {lang('Allow free form comments when adding products to cart')}
            </div>
        </div>
        <div className='mb-4 mx-4'>
            <label htmlFor='productPermalink'>{lang('Permalink')}</label>
            <PermalinkInput placeholder={lang('Permalink for the product')} validateLabel={lang('Validate')}
                value={product?.productPermalink}
            />
            <div className='text-gray-500'>{lang('This sets a readable URL for the product')}</div>
        </div>
        {config.paymentGateway.includes('stripe') && <div className='mb-4 mx-4'>
            <label htmlFor='productSubscription'>{lang('Subscription plan')}</label>
            <Input type='text' id='productSubscription' name='subscription' placeholder='plan_XXXXXXXXXXXXXX'
                value={product?.productSubscription}
            />
            <div className='text-gray-500'>
                {lang('First setup the plan in "Stripe" dashboard and enter the Plan ID. Format: plan_XXXXXXXXXXXXXX')}
            </div>
        </div>}
        <div className='mb-4 mx-4'>
            <label htmlFor='productTags'>{lang('Product tag words')}</label>
            <Keywords name='tags' value={product?.tags} />
            <div className='text-gray-500'>
                {lang('Tag words used to indexed products, making them easier to find and filter.')}
            </div>
        </div>
    </Form>
    </Template>;
}