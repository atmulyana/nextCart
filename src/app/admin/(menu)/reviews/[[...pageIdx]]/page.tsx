/** 
 * https://github.com/atmulyana/nextCart
 **/
import React from 'react';
import {notFound} from 'next/navigation';
import config from '@/config';
import lang from '@/data/lang';
import {awaitProps, fnMeta, isIndexNumber} from '@/lib/common';
import modules from '@/lib/modules/server';
import Paging from '@/subview/components/Paging';
import SearchBox from '@/subview/components/SearchBox';
import Template from '@/subview/partials/Template';

export const generateMetadata = fnMeta(async () => {
    return {
        title: `${config.cartTitle}: ${lang('Reviews')}`,
    };
});

export default async function AdminCustomers(props: {params: Promise<{pageIdx?: string[], search?: string}>}) {
    let {params: {pageIdx = ['1'], search}} = await awaitProps(props);
    if (pageIdx.length > 1 || !isIndexNumber(pageIdx[0])) return notFound();
    const page = parseInt(pageIdx[0]);
    if (page < 1) return notFound();
    search = decodeURIComponent(search || '');

    if (!modules.reviews) return notFound();
    const {AdminReviews, getReviews} = modules.reviews;
    const reviews = await getReviews(search, page, 5);

    return <Template>
        <h2>{lang('Reviews')}</h2>
        <SearchBox url='/admin/reviews' filterText={lang('Filter')}
            description={lang('Reviews can be filtered by: review title or review description keywords')} />
        <AdminReviews list={await reviews.count() < 1 ? null : reviews.list} search={search} />
        <div className='flex justify-center w-full'>
            <Paging
                pageCount={await reviews.pageCount()}
                selectedPage={page}
                href={search ? `/admin/reviews/filter/${encodeURIComponent(search)}` : '/admin/reviews'}
            />
        </div>
    </Template>;
}