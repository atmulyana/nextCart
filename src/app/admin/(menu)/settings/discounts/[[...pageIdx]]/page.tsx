/** 
 * https://github.com/atmulyana/nextCart
 **/
import React from 'react';
import Link from 'next/link';
import {notFound} from 'next/navigation';
import {emptyString} from 'javascript-common';
import config from '@/config';
import lang from '@/data/lang';
import {getDiscounts} from '@/data/discount';
import {awaitProps, fnMeta, isIndexNumber} from '@/lib/common';
import DeleteButton from '@/components/DeleteButton';
import Icon from '@/components/Icon';
import Form from '@/components/Form';
import Paging from '@/components/Paging';
import Template from '@/components/partials/Template';
import {remove} from '../actions';

export const generateMetadata = fnMeta(async () => {
    return {
        title: `${config.cartTitle}: ${lang('Discount codes')}`,
    };
});

export default async function DiscountCodes(props: {params: Promise<{pageIdx?: string[]}>}) {
    const {params: {pageIdx = ['1']}} = await awaitProps(props);
    if (pageIdx.length > 1 || !isIndexNumber(pageIdx[0])) return notFound();
    const pageNum = parseInt(pageIdx[0]);
    if (pageNum < 1) return notFound();

    const discounts = await getDiscounts(pageNum),
          now = new Date();
    let _id: string = emptyString;

    return <Template>
        <div className='flex'>
            <h2 className='flex-1'>{lang('Discount codes')}</h2>
            <Link href='/admin/settings/discounts/form' className='flex-none btn btn-outline-success'>{lang('New discount')}</Link>
        </div>
        
        {discounts.totalItems < 1 ? (<>
            <h4 className="text-[var(--color-warning)] text-center">{lang("There are currently no discount codes setup.")}</h4>
        </>) : (<ul className='bordered'>
            <li className='!flex bg-gray-200 dark:bg-gray-800'>
                <strong className='flex-1'>{lang('Code')}</strong>
                <strong className='w-1/4 shrink-0 text-right ml-4'>{lang('Value')}</strong>
                <strong className='whitespace-nowrap ml-4'>{lang('In effect')}</strong>
                <strong className='ml-4'>{lang('Edit')}</strong>
                <strong className='ml-4'>{lang('Delete')}</strong>
            </li>
            {discounts.data.map(d => (_id = d._id.toString(),
                <li key={_id} className='!flex bg-[var(--bg-color)] hover:bg-gray-100 hover:dark:bg-gray-900'>
                    <span className='flex-1'>{d.code}</span>
                    <span className='w-1/4 shrink-0 text-right ml-4'>{d.value}{d.type == 'percent' ? '%' : emptyString}</span>
                    <div className='relative ml-4'>
                        <strong className='opacity-0 whitespace-nowrap'>{lang('In effect')}</strong>
                        <span
                            className={`absolute left-0 top-0 right-0 bottom-0 text-center ${
                                d.start > now ? 'text-gray-500' :
                                d.end < now   ? 'text-[var(--color-danger)]' :
                                                'text-[var(--color-success)]'
                            }`}
                            title={lang(
                                d.start > now ? 'Not in effect yet' :
                                d.end < now   ? 'Expired' :
                                                'In effect'
                            )}
                        >
                            <Icon name={d.start <= now && now <= d.end ? 'check' : 'slash'} strokeWidth={4} />
                        </span>
                    </div>
                    <div className='relative ml-4'>
                        <strong className='opacity-0'>{lang('Edit')}</strong>
                        <span className='absolute left-0 top-0 right-0 bottom-0 text-center'>
                            <Link href={`/admin/settings/discounts/form/${_id}`} title={lang('Edit')}><Icon name='edit' /></Link>
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
                            <DeleteButton question={lang('Are you sure you want to proceed?')} title={lang('Delete')} />
                        </Form>
                    </span>
                </li>
            ))}
        </ul>)}
        <div className='flex justify-center w-full'>
            <Paging
                pageCount={Math.ceil(discounts.totalItems / discounts.itemsPerPage)}
                selectedPage={pageNum}
                href={'/admin/settings/discounts'}
            />
        </div>
    </Template>;
}