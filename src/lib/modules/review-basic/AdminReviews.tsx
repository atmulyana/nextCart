/** 
 * https://github.com/atmulyana/nextCart
 **/
import React from 'react';
import type {WithId} from '@/data/types';
import lang from '@/data/lang';
import DeleteButton from '@/subview/components/DeleteButton';
import Form from '@/subview/components/Form';
import {type TReview} from './data';
import {removeReview} from './postHandler';

export default async function AdminReviews({list, search}: {list: Array<WithId<TReview>> | null, search?: string}) {
    let _id = '';
    return <ul className='bordered'>
        <li className='!flex bg-gray-200 dark:bg-gray-800'>
            <strong className='basis-1/4 shrink-0'>{lang('Title')}</strong>
            <strong className='flex-1 ml-4'>{lang('Description')}</strong>
            <strong className='ml-4'>{lang('Rating')}</strong>
            <strong className='ml-4'>{lang('Delete')}</strong>
        </li>
        {search && <li className='bg-[var(--bg-color)] !py-0'>
            <small className='text-blue-500 mr-4'>({lang('Filtered term')}: {search})</small>
        </li>}
        {list === null ? (
            <li className='bg-[var(--bg-color)] text-center'>{lang('No review yet')}</li>
        ) : list.map(r => (_id = r._id.toString(),
            <li key={_id} className='!flex bg-[var(--bg-color)]'>
                <div className='basis-1/4 shrink-0 text-ellipsis whitespace-nowrap overflow-hidden' title={r.title}>{r.title}</div>
                <div className='flex-1 text-ellipsis whitespace-nowrap overflow-hidden ml-4' title={r.description}>{r.description}</div>
                <div className='relative ml-4'>
                    <strong className='opacity-0'>{lang('Rating')}</strong>
                    <div className='absolute left-0 top-0 right-0 bottom-0 text-center'>
                        <span className='leading-none align-middle'>{`${r.rating}/5`}</span>
                    </div>
                </div>
                <div className='relative ml-4'>
                    <strong className='opacity-0'>{lang('Delete')}</strong>
                    <Form 
                        action={removeReview}
                        className='!absolute left-0 top-0 right-0 bottom-0 text-center text-[var(--color-danger)]'
                        loading={null}
                        refreshThreshold='success'
                    >
                        <input type='hidden' name='id' value={_id} />
                        <DeleteButton question={lang('Are you sure you want to delete this review?')} />
                    </Form>
                </div>
            </li>
        ))}
    </ul>;
}