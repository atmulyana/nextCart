/** 
 * https://github.com/atmulyana/nextCart
 **/
import React from 'react';
import config from '@/config';
import lang from '@/data/lang';
import {fnMeta} from '@/lib/common';
import ProductList, {type ProductListProps} from '@/partials/ProductList';

export const generateMetadata = fnMeta<{pageNum: string}>(async ({params: {pageNum}}) => {
    return {
        description: `${config.cartTitle} - ${lang('Products page')}: ${pageNum}`
    };
});

export default async function PagingProducts(props: ProductListProps) {
    return <ProductList {...props} />;
}
