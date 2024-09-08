/** 
 * https://github.com/atmulyana/nextCart
 **/
import {notFound} from 'next/navigation';
import {toId} from '@/data/db-conn';
import type {TReviewList} from '@/lib/modules/review-basic/data';
import {getReviews} from '@/lib/modules/review-basic/data';
import {isIndexNumber} from '@/lib/common';
import {createGetHandler, type HandlerParams} from '@/lib/routeHandler';

export const GET = createGetHandler(async ({
    params: {id, pageNum}
} : HandlerParams<{
    id: string,
    pageNum: string,
}>) => {
    if (!isIndexNumber(pageNum)) return notFound();
    const pageIdx = parseInt(pageNum);

    let reviews: TReviewList | undefined;
    const productId = toId(id);
    if (productId) reviews = await getReviews(productId, pageIdx);

    return reviews;
});