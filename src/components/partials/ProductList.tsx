/** 
 * https://github.com/atmulyana/nextCart
 **/
import React from 'react';
import Link from 'next/link';
import {notFound} from 'next/navigation';
import config from '@/config';
import type {TProductItem} from '@/data/types';
import lang from '@/data/lang';
import {addCartItem} from '@/app/actions';
import {GET} from '@/app/(shop)/data/route';
import {awaitProps, currencySymbol, formatAmount, type PromiseProps} from '@/lib/common';
import {CartForm} from '@/components/Cart';
import FlexImage from '@/components/FlexImage';
import Paging from '@/components/Paging';
import Button from '@/components/SubmitButton';
import Select from '@/components/SubmittedSelect';
import Template from '@/components/partials/Template';
import FrontMenu from './FrontMenu';

const ColsToBasis = {
    1: 'basis-full',
    2: 'basis-1/2',
    3: 'basis-1/3',
    4: 'basis-1/4'
};

export type ProductListProps = PromiseProps<Pick<Parameters<typeof GET.data>[0], 'params' | 'searchParams'>>;

class Title extends String {
    searchTerm?: string;
}

export function getTitle(pageUrl?: string, searchTerm?: string) {
    searchTerm = searchTerm?.trim() || '';
    let title: Title | undefined;
    if (pageUrl == 'category') {
        title = new Title(`${lang('Category')}: ${searchTerm}`);
    }
    else if (pageUrl == 'search') {
        title = new Title(`${lang('Search results')}: ${searchTerm}`);
    }
    else if (pageUrl && pageUrl != 'page') {
        notFound();
    }
    if (title) title.searchTerm = searchTerm;
    return title;
}

export default async function ProductList(props: ProductListProps) {
    const props2 = await awaitProps(props)
    const data = await GET.data(props2);
    const {params: {pageUrl = 'page', searchTerm}} = props2;
    const title = getTitle(pageUrl, searchTerm)
    const titleParts = title && title.split(': ');

    const itemBasis = ColsToBasis[config.productsPerRow] || ColsToBasis[3];
    const itemClass = `relative ${itemBasis} grow-0 shrink-0 px-1`;

    const pageHref = title?.searchTerm ? `/${pageUrl}/${encodeURIComponent(title.searchTerm)}` : `/${pageUrl}`;
    const totalPage = Math.ceil(data.totalProductCount / config.productsPerPage);

    return <Template>
        <FrontMenu />
        
        <div className='relative px-4 basis-full md:mx-auto md:basis-2/3 grow-0 shrink-0'>
            {titleParts && <h5 className='relative w-full px-4 pt-7'>{titleParts[0]}: <strong>{titleParts[1]}</strong></h5>}
            
            <div className='flex flex-wrap -mx-4 pt-7'>{data.results.length < 1 ? (
                <div className='pl-8 w-full mb-4'>
                    <p className='text-red-500'>{lang('No products found')}</p>
                </div>
            ) : (
                data.results.map(product => <Item key={product._id.toString()} className={itemClass} data={product} />)
            )}</div>
        
            <div className='flex justify-center w-full'>
                <Paging pageCount={totalPage} selectedPage={data.pageNum} href={pageHref} />
            </div>
        </div>
    </Template>;
}

function Item({
    className,
    data,
}: {
    className: string,
    data: TProductItem,
}) {
    const productId = data._id.toString();
    return <div className={className + (data.productPermalink ? ' product-wrapper' : '')}>
        <Link className='block flex-none bg-[var(--bg-color)] text-[var(--fg-color)]'
            href={`/product/${data.productPermalink ? data.productPermalink : productId}`}
            prefetch={false}
        >
            <FlexImage src={data.productImage} alt='...' />
            <h6 className='block mt-0 pt-2.5 text-center text-lg'>{data.productTitle}</h6>
        </Link>
        <CartForm className='w-full' action={addCartItem}>
            <input type='hidden' name='productId' value={productId} />
            {data.variants && data.variants.length > 0 ? (
                config.showHomepageVariants ? (
                    <Select name='productVariant' noValidation className='mb-2'>
                        {data.variants.map((variant, idx) => <option key={idx} value={variant._id.toString()}>
                            {variant.title} - {currencySymbol()}{formatAmount(variant.price)}
                        </option>)}
                    </Select>
                ) : (
                    <>
                        <h6 className='text-center text-lg py-[calc(0.25rem+1px)] mb-2 text-neutral-500'>
                            {currencySymbol()}{formatAmount(data.variants[0].price)}
                        </h6>
                        <input type='hidden' name='link' value={`${data.productPermalink ? data.productPermalink : productId}`} />
                    </>
                )
            ) : (
                <h6 className='text-center text-lg py-[calc(0.25rem+1px)] mb-2 text-neutral-500'>
                    {currencySymbol()}{formatAmount(data.productPrice)}
                </h6>
            )}
            <p className='text-center mb-4'>
                <Button className='btn-primary'>{lang('Add to cart')}</Button>
            </p>
        </CartForm>
    </div>;
}
