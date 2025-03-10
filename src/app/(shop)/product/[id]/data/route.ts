/** 
 * https://github.com/atmulyana/nextCart
 **/
import {notFound} from 'next/navigation';
import type {ObjectId} from '@/data/db-conn';
import type {TProduct, TProductImagePath, TProductItem, TVariant} from '@/data/types';
import {getProduct, getProducts} from '@/data/product';
import {createGetHandler, type HandlerParams} from '@/lib/routeHandler';
import modules from '@/lib/modules/server';

type TReviewModule = NonNullable<typeof modules.reviews>;
type TReviewList = Extract<Awaited<ReturnType<TReviewModule['getReviews']>>, {isNext: boolean}>;
export type Return = {
    title?: string,
    result: TProduct,
    variants?: TVariant[],
    reviews?: TReviewModule extends never ? undefined
        : TReviewList & Awaited<ReturnType<TReviewModule['getReviewSummary']>>,
    relatedProducts: TProductItem[],
    images: TProductImagePath[],
};

export const GET = createGetHandler(async ({
    params: {id},
    isFromMobile
} : HandlerParams<{
    id: string,
}>) => {
    const product = await getProduct(id);
    if (!product || product.productPublished === false) return notFound();

    const images: TProductImagePath[] = [],
          productId = product._id.toString();
    for (let i = 0; i < product.imageCount; i++) {
        if (i === product.imgaeDefaultIndex) {
            images.unshift({ //The default image is always at the first
                id: i,
                path: `/product/${productId}/image/${i}`,
                productImage: true,
            });
        }
        else {
            images.push({
                id: i,
                path: `/product/${productId}/image/${i}`,
                productImage: false,
            });
        }
    }

    const relatedWords = product.productTitle + ' ' + product.tags.concat(' ');
    const relatedProducts = (await getProducts(
        1,
        {
            $and: [
                {$text: { $search: relatedWords }},
                {_id: {$ne: product._id}},
            ]
        },
        4
    )).data;

    const ret: Return = {
        result: product,
        images,
        relatedProducts,
    };
    if (modules.reviews) {
        ret.reviews = {
            ...(await modules.reviews.getReviews(product._id as ObjectId)),
            ...(await modules.reviews.getReviewSummary(product._id as ObjectId)),
        };
    }
    if (isFromMobile) {
        ret.title = product.productTitle;
        ret.variants = product.variants;
        delete product.variants;
    }
    return ret;
});