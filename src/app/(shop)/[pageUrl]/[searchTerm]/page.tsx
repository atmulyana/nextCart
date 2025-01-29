/** 
 * https://github.com/atmulyana/nextCart
 **/
import React from 'react';
import config from '@/config';
import {fnMeta} from '@/lib/common';
import ProductList, {getTitle, type ProductListProps} from '@/subview/partials/ProductList';

export const generateMetadata = fnMeta<{
    pageUrl: string,
    searchTerm: string
}>(async ({params: {pageUrl, searchTerm}}) => {
    const title = getTitle(pageUrl, searchTerm);
    if (title) {
        return {
            title: title.toString(),
            description: `${config.cartTitle} - ${title}`
        };
    }
    return {};
});

export default async function SearchProducts(props: ProductListProps) {
    return <ProductList {...props} />;
}
