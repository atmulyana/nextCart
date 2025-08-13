/** 
 * https://github.com/atmulyana/nextCart
 **/
import React from 'react';
import Link from 'next/link';
import {notFound} from 'next/navigation';
import config from '@/config';
import lang from '@/data/lang';
import {getCustomers} from '@/data/customer';
import {awaitProps, fnMeta, isIndexNumber} from '@/lib/common';
import Icon from '@/components/Icon';
import Form from '@/components/Form';
import DeleteButton from '@/components/DeleteButton';
import Paging from '@/components/Paging';
import SearchBox from '@/components/SearchBox';
import Template from '@/components/partials/Template';
import {remove} from '../actions';

export const generateMetadata = fnMeta(async () => {
    return {
        title: `${config.cartTitle}: ${lang('Customers')}`,
    };
});

export default async function AdminCustomers(props: {params: Promise<{pageIdx?: string[], search?: string}>}) {
    let {params: {pageIdx = ['1'], search}} = await awaitProps(props);
    if (pageIdx.length > 1 || !isIndexNumber(pageIdx[0])) return notFound();
    const page = parseInt(pageIdx[0]);
    if (page < 1) return notFound();
    search = decodeURIComponent(search || '');

    const customers = await getCustomers({search, page});
    let _id: string = '';

    return <Template>
        <h2>{lang('Customers')}</h2>
        <SearchBox url='/admin/customers' filterText={lang('Filter')}
            description={lang('Customers can be filtered by: email, name or phone number')} />
        <ul className='bordered'>
            <li className='!flex bg-gray-200 dark:bg-gray-800'>
                <strong className='basis-3/12 shrink-0'>{lang('Email address')}</strong>
                <strong className='flex-1 ml-4'>{lang('Name')}</strong>
                <strong className='basis-2/12 shrink-0 ml-4'>{lang('Phone number')}</strong>
                <strong className='ml-4'>{lang('Edit')}</strong>
                <strong className='ml-4'>{lang('Delete')}</strong>
            </li>
            {search && <li className='bg-[var(--bg-color)] !py-0'>
                <small className='text-blue-500 mr-4'>({lang('Filtered term')}: {search})</small>
            </li>}
            {await customers.count() < 1 ? (
                <li className='bg-[var(--bg-color)] text-center'>{lang('No customers found')}</li>
            ) : customers.list.map(c => (_id = c._id.toString(),
                <li key={_id} className='!flex bg-[var(--bg-color)] hover:bg-gray-100 hover:dark:bg-gray-900'>
                    <span className='basis-3/12 shrink-0'>{c.email}</span>
                    <span className='flex-1 ml-4'>{c.firstName} {c.lastName}</span>
                    <span className='basis-2/12 shrink-0 ml-4'>{c.phone}</span>
                    <div className='relative ml-4'>
                        <strong className='opacity-0'>{lang('Edit')}</strong>
                        <span className='absolute left-0 top-0 right-0 bottom-0 text-center'>
                            <Link href={`/admin/customers/edit//${_id}`}><Icon name='edit' /></Link>
                        </span>
                    </div>
                    <span className='relative ml-4'>
                        <strong className='opacity-0'>{lang('Delete')}</strong>
                        <Form 
                            action={remove}
                            className='!absolute left-0 top-0 right-0 bottom-0 text-center text-[var(--color-danger)]'
                            loading={null}
                            refreshThreshold='success'
                        >
                            <input type='hidden' name='id' value={_id} />
                            <DeleteButton question={lang('Are you sure you want to delete this customer?')} />
                        </Form>
                    </span>
                </li>
            ))}
        </ul>
        <div className='flex justify-center w-full'>
            <Paging
                pageCount={await customers.pageCount()}
                selectedPage={page}
                href={search ? `/admin/customers/filter/${encodeURIComponent(search)}` : '/admin/customers'}
            />
        </div>
    </Template>;
}