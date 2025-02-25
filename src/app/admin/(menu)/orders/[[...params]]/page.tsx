/** 
 * https://github.com/atmulyana/nextCart
 **/
import React from 'react';
import Link from 'next/link';
import {notFound} from 'next/navigation';
import JsSimpleDateFormat from 'jssimpledateformat';
import config from '@/config';
import lang from '@/data/lang';
import {getOrders} from '@/data/order';
import type {OrderStatus} from '@/data/types';
import {awaitProps, fnMeta, getStatusColor, isIndexNumber} from '@/lib/common';
import DeleteButton from '@/subview/components/DeleteButton';
import Form from '@/subview/components/Form';
import Icon from '@/subview/components/Icon';
import {getStatusOptions, getStatusText} from '../common';
import {Paging, SearchBox} from '../components';
import {remove} from '../actions';

export const generateMetadata = fnMeta(async () => {
    return {
        title: `${config.cartTitle}: ${lang('Orders')}`,
    };
});

export default async function AdminOrders(props: {params: Promise<{
    params?: string[],
    search?: string,
}>}) {
    let pageNum = 1, status: OrderStatus | undefined;
    let {params: {params, search}} = await awaitProps(props);
    search = decodeURIComponent(search || '');
    if (params) {
        if (params.length == 1 && isIndexNumber(params[0])) {
            pageNum = parseInt(params[0]);
        }
        else if (params.length == 2 && params[0] == 'status') {
            status = params[1] as any;
        }
        else if (params.length == 3 && isIndexNumber(params[0]) && params[1] == 'status') {
            pageNum = parseInt(params[0]);
            status = params[2] as any;
        }
        else {
            pageNum = 0;
        }

        if (pageNum < 1) return notFound();
        status = decodeURIComponent(status || '') as any;
    }


    const dtFormat = new JsSimpleDateFormat('dd/MM/yyyy HH:mm', 'en');
    const orders = await getOrders({
        search,
        status,
        page: pageNum
    });
    let _id: string = '';

    return <>
        <h2>{lang('Orders')}</h2>
        <SearchBox
            byStatusText={lang('By status')}
            description={lang('Orders can be filtered by: customer name, email address or postcode/zipcode')}
            filterText={lang('Filter')}
            statuses={getStatusOptions()}
        />
        <ul className='bordered'>
            <li className='!flex bg-gray-200 dark:bg-gray-800'>
                <strong className='w-36 mr-4'>{lang('Date')}</strong>
                <strong className='w-56 mr-4'>{lang('Email address')}</strong>
                <strong className='grow mr-4'>{lang('Customer')}</strong>
                <strong className='mr-4'>{lang('Status')}</strong>
                <strong className='mr-4'>{lang('View')}</strong>
                <strong>{lang('Delete')}</strong>
            </li>
            {(search || status) && <li className='bg-[--bg-color] !py-0'>
                {search && <small className='text-blue-500 mr-4'>({lang('Filtered term')}: {search})</small>}
                {status && <small className='text-blue-500 mr-4'>({lang('Status')}: {lang(status)})</small>}
            </li>}
            {!orders.data || orders.data.length < 1 ? (
                <li className='bg-[--bg-color] text-center'>{lang('No orders found')}</li>
            ) : orders.data.map(o => (_id = o._id.toString(),
                <li key={_id} className='!flex bg-[--bg-color]'>
                    <div className='w-36 mr-4'>{o.orderDate && dtFormat.format(o.orderDate)}</div>
                    <div className='w-56 text-ellipsis mr-4'>{o.orderEmail}</div>
                    <div className='grow mr-4'>{o.orderFirstname} {o.orderLastname}</div>
                    <div className='mr-4' style={{color: `var(--color-${getStatusColor(o.orderStatus)})`}}>{getStatusText(o.orderStatus)}</div>
                    <div className='relative mr-4'>
                        <strong className='opacity-0'>{lang('View')}</strong>
                        <span className='absolute left-0 top-0 right-0 bottom-0 text-center'>
                            <Link href={`/admin/orders/view/${_id}`}><Icon name='file' /></Link>
                        </span>
                    </div>
                    <div className='relative'>
                        <strong className='opacity-0'>{lang('Delete')}</strong>
                        <Form 
                            action={remove}
                            className='!absolute left-0 top-0 right-0 bottom-0 text-center text-[--color-danger]'
                            loading={null}
                            refreshThreshold='success'
                        >
                            <input type='hidden' name='id' value={_id} />
                            <DeleteButton question={lang('Are you sure you want to delete this order?')} />
                        </Form>
                    </div>
                </li>
            ))}
        </ul>
        <div className='flex justify-center w-full'>
            <Paging
                pageCount={await orders.pageCount()}
                selectedPage={pageNum}
            />
        </div>
    </>;
}