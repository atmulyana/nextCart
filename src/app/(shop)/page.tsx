/** 
 * https://github.com/atmulyana/nextCart
 **/
import React from 'react';
import ProductList, {type ProductListProps} from '@/components/partials/ProductList';

export default async function Home(props: ProductListProps) {
    return <ProductList {...props} />;
}