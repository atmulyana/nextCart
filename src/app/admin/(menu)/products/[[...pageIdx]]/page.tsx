/** 
 * https://github.com/atmulyana/nextCart
 **/
import React from 'react';
import Link from 'next/link';
import {notFound} from 'next/navigation';
import config from '@/config';
import lang from '@/data/lang';
import {getProducts} from '@/data/product';
import {awaitProps, fnMeta, isIndexNumber} from '@/lib/common';
import Icon from '@/subview/components/Icon';
import Form from '@/subview/components/Form';
import Paging from '@/subview/components/Paging';
import SearchBox from '@/subview/components/SearchBox';
import Template from '@/subview/partials/Template';
import {remove, updatePublished} from '../actions';
import {DeleteButton, PublishedCheckBox} from './components';

export const generateMetadata = fnMeta(async () => {
    return {
        title: `${config.cartTitle}: ${lang('Products')}`,
    };
});

export default async function AdminProducts(props: {params: Promise<{pageIdx?: string[], search?: string}>}) {
    const {params: {pageIdx = ['1'], search}} = await awaitProps(props);
    if (pageIdx.length > 1 || !isIndexNumber(pageIdx[0])) return notFound();
    const pageNum = parseInt(pageIdx[0]);
    if (pageNum < 1) return notFound();

    const query: any = {$sort: {productAddedDate: -1}};
    if (search?.trim()) query.$text = {$search: decodeURIComponent(search).trim()};
    const products = await getProducts(pageNum, query, config.itemsPerPage);
    let _id: string = '';

    return <Template>
        <h2>{lang('Products')}</h2>
        <SearchBox url='/admin/products' filterText={lang('Filter')}
            description={lang('Products can be filtered by: product title or product description keywords')} />
        <ul className='bordered'>
            <li className='!flex bg-gray-200 dark:bg-gray-800'>
                <strong className='flex-1'>
                    {lang('Product title')}
                    {search && <small className='text-blue-500'>&nbsp;({lang('Filtered term')}: {decodeURIComponent(search)})</small>}
                </strong>
                <strong className='ml-4'>{lang('Published')}</strong>
                <strong className='ml-4'>{lang('Edit')}</strong>
                <strong className='ml-4'>{lang('Delete')}</strong>
            </li>
            {products.totalItems < 1 ? (
                <li className='bg-[--bg-color] text-center'>{lang('No products found')}</li>
            ) : products.data.map(p => (_id = p._id.toString(),
                <li key={_id} className='!flex bg-[--bg-color]'>
                    <span className='flex-1'>{p.productTitle}</span>
                    <span className='relative ml-4'>
                        <strong className='opacity-0'>{lang('Published')}</strong>
                        <Form
                            action={updatePublished}
                            className='!absolute left-0 top-0 right-0 bottom-0 text-center'
                            loading={null}
                            refreshThreshold='danger'
                        >
                            <input type='hidden' name='id' value={_id} />
                            <PublishedCheckBox checked={p.productPublished !== false} />
                        </Form>
                    </span>
                    <div className='relative ml-4'>
                        <strong className='opacity-0'>{lang('Edit')}</strong>
                        <span className='absolute left-0 top-0 right-0 bottom-0 text-center'>
                            <Link href={`/admin/products/edit//${_id}`}><Icon name='edit' /></Link>
                        </span>
                    </div>
                    <span className='relative ml-4'>
                        <strong className='opacity-0'>{lang('Delete')}</strong>
                        <Form 
                            action={remove}
                            className='!absolute left-0 top-0 right-0 bottom-0 text-center text-[--color-danger]'
                            loading={null}
                            refreshThreshold='warning'
                        >
                            <input type='hidden' name='id' value={_id} />
                            <DeleteButton question={lang('Are you sure you want to delete this product?')} />
                        </Form>
                    </span>
                </li>
            ))}
        </ul>
        <div className='flex justify-center w-full'>
            <Paging
                pageCount={Math.ceil(products.totalItems / products.itemsPerPage)}
                selectedPage={pageNum}
                href={search ? `/admin/products/filter/${search}` : '/admin/products'}
            />
        </div>
    </Template>;
}