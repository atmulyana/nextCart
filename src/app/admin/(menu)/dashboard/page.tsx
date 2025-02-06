/** 
 * https://github.com/atmulyana/nextCart
 **/
import React from 'react';
import {getOrderSummary} from '@/data/order';
import {getActiveProductCount} from '@/data/product';
import lang from '@/data/lang';
import {currencySymbol, fnMeta, formatAmount} from '@/lib/common';
import FlexImage from '@/subview/components/FlexImage';

export const generateMetadata = fnMeta(async () => {
    return {
        title: `${lang('Shop')}: ${lang('Dashboard')}`,
    };
});

export default async function AdminDashboard() {
    const productCount = await getActiveProductCount();
    const summary = await getOrderSummary();
    let pId: string = '';
    return <>
        <h2 className='px-3.5'>{lang('Dashboard')}</h2>
        <div className='flex flex-wrap'>
            <div className='basis-1/2 shrink-0 px-3.5 pb-7'>
                <div className='flex flex-col break-words bg-white dark:bg-black bg-clip-border
                                border-solid border rounded border-black/15 dark:border-white/15'>
                    <div className='flex-auto p-5 min-h-px text-center'>
                        <h5 className='mb-3'>{lang('Orders placed')}</h5>
                        <h6 className='-mt-1.5 mb-2 text-gray-500'>{lang('Total number of orders placed')}</h6>
                        <h4 className='mb-0 text-[--color-danger]'>{summary.orderCount}</h4>
                    </div>
                </div>
            </div>
            <div className='basis-1/2 shrink-0 px-3.5 pb-7'>
                <div className='flex flex-col break-words bg-white dark:bg-black bg-clip-border
                                border-solid border rounded border-black/15 dark:border-white/15'>
                    <div className='flex-auto p-5 min-h-px text-center'>
                        <h5 className='mb-3'>{lang('Order total value')}</h5>
                        <h6 className='-mt-1.5 mb-2 text-gray-500'>{lang('Total value of orders placed')}</h6>
                        <h4 className='mb-0 text-[--color-danger]'>{currencySymbol()}{formatAmount(summary.orderAmount)}</h4>
                    </div>
                </div>
            </div>
            <div className='basis-1/2 shrink-0 px-3.5 pb-7'>
                <div className='flex flex-col break-words bg-white dark:bg-black bg-clip-border
                                border-solid border rounded border-black/15 dark:border-white/15'>
                    <div className='flex-auto p-5 min-h-px text-center'>
                        <h5 className='mb-3'>{lang('Products for sale')}</h5>
                        <h6 className='-mt-1.5 mb-2 text-gray-500'>{lang('Number of products for sale')}</h6>
                        <h4 className='mb-0 text-[--color-danger]'>{productCount}</h4>
                    </div>
                </div>
            </div>
            <div className='basis-1/2 shrink-0 px-3.5 pb-7'>
                <div className='flex flex-col break-words bg-white dark:bg-black bg-clip-border
                                border-solid border rounded border-black/15 dark:border-white/15'>
                    <div className='flex-auto p-5 min-h-px text-center'>
                        <h5 className='mb-3'>{lang('Total products sold')}</h5>
                        <h6 className='-mt-1.5 mb-2 text-gray-500'>{lang('Number of products sold')}</h6>
                        <h4 className='mb-0 text-[--color-danger]'>{summary.productsSold}</h4>
                    </div>
                </div>
            </div>
            <div className='basis-full shrink-0 px-3.5 pb-7'>
                <div className='flex flex-col break-words bg-white dark:bg-black bg-clip-border
                                border-solid border rounded border-black/15 dark:border-white/15'>
                    <div className='flex-auto p-5 min-h-px text-center'>
                        <h5 className='mb-3'>{lang('Top products sold')}</h5>
                        <ul className='pl-0 list-none'>{summary.topProducts.length > 0
                            ? summary.topProducts.map(item => (pId = item._id.toString(),
                                <li key={pId} className='flex items-start align-middle my-6'>
                                    <div className='mr-4 basis-1/6 shrink-0'>
                                        <FlexImage src={`/product/${pId}/image`} alt={`Image ${item.title}`} />
                                    </div>
                                    <div className='flex-1'>
                                        <h5 className='mt-4 mb-1'>{item.title}</h5>
                                        <h4 className='mt-6'>{lang('Sold')}: <span className='text-[--color-danger]'>{item.count}</span></h4>
                                    </div>
                                </li>
                            ))
                            : <h5 className="mt-4 mb-1 text-[--color-danger]">{lang('Nothing to see yet. Do some orders.')}</h5>
                        }</ul>
                    </div>
                </div>
            </div>
        </div>
    </>;
}