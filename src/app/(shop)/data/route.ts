/** 
 * https://github.com/atmulyana/nextCart
 **/
import {notFound} from 'next/navigation';
import type {NotificationParam} from '@/subview/components/Notification';
import {isIndexNumber} from '@/lib/common';
import {createGetHandler, type HandlerParams} from '@/lib/routeHandler';
import {getProducts} from '@/data/product';
import {getMenu, sortMenu} from '@/data/menu';
import {getTitle} from '@/subview/partials/ProductList';

type Return = {
    title?: string,
    results: Awaited<ReturnType<typeof getProducts>>['data'],
    totalProductCount: number,
    pageNum: number,
    filtered?: boolean,
    paginateUrl?: string,
    searchTerm?: string,
    menu?: {
        items: ReturnType<typeof sortMenu>,
    },
    message?: string,
    messageType?: NotificationParam['type'],
};

export const GET = createGetHandler(async ({
    params,
    isFromMobile
} : HandlerParams<{
    pageUrl?: string,
    searchTerm?: string,
    pageNum?: string,
}>) => {
    const
        pageNum = params.pageNum ? (
            isIndexNumber(params.pageNum) ? parseInt(params.pageNum, 10) : notFound()
        ) : 1,
        {pageUrl = 'page', searchTerm} = params,
        title = getTitle(pageUrl, searchTerm),
        filtered = !!title?.searchTerm;
    let query = {};
    if (filtered) {
        if (pageUrl == 'category') {
            query = {tags: title.searchTerm};
        }
        else if (pageUrl == 'search') {
            query = {$text: { $search: title.searchTerm }};
        }
        else {
            notFound();
        }
    }
    const results = await getProducts(pageNum, query);
    const ret: Return = {
        title: title as (string | undefined),
        results: results.data,
        totalProductCount: results.totalItems,
        pageNum,
    };
    if (isFromMobile) {
        ret.searchTerm = title?.searchTerm;
        ret.filtered = filtered;
        ret.paginateUrl = pageUrl;
        ret.menu = {
            items: sortMenu(await getMenu()),
        };
    }
    return ret;
});