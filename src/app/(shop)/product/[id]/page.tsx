/** 
 * https://github.com/atmulyana/nextCart
 **/
import React from 'react';
import Link from 'next/link';
import Ellipsis from '@react-packages/ellipsis';
import {stripHtml} from 'string-strip-html';
import config from '@/config';
import lang from '@/data/lang';
import {getProduct} from '@/data/product';
import FlexImage from '@/components/FlexImage';
import {CartForm} from '@/components/Cart';
import FrontMenu from '@/components/partials/FrontMenu';
import Button from '@/components/SubmitButton';
import TextArea from '@/components/SubmittedTextArea';
import Template from '@/components/partials/Template';
import {awaitProps, currencySymbol, fixTags, fnMeta, formatAmount, snip, type PromiseProps} from '@/lib/common';
import modules from '@/lib/modules';
import {addCartItem} from '@/app/actions';
import {GET} from './data/route';
import ImageSlider from './ImageSlider';
import Quantity from './Quantity';
import ReviewControls from './ReviewControls';
import Variants from './Variants';

type Props = PromiseProps<Pick<Parameters<typeof GET.data>[0], 'params' | 'searchParams'>>;

export const generateMetadata = fnMeta<{
    id: string,
}>(async ({params: {id}}) => {
    const product = await getProduct(id);
    if (product) {
        let description = snip(stripHtml(product.productDescription).result.trim()) || `${config.cartTitle} - ${product.productTitle}`;
        const pageUrl = config.baseUrl + '/product/' + id;
        return {
            alternates: {
                canonical: pageUrl,
            },
            description,
            openGraph: {
                type: 'website',
                
                /** set by `fnMeta` */
                //title: product.productTitle,
                //url: pageUrl,
                //description,
                
                images: `${pageUrl}/image`,
            },
            title: product.productTitle,
            // twitter: {
            //     card: 'product',
                
            //     /** set by `fnMeta` */
            //     //title: product.productTitle,
            //     //site: pageUrl,
            // },
        };
    }
    return {};
});

export default async function Product(props: Props) {
    const {
        result: product,
        reviews,
        images,
        relatedProducts,
    } = await GET.data(await awaitProps(props));
    const productId = product._id.toString();
    const pageUrl = config.baseUrl + '/product/' + productId;

    const ldJson: any = {
        "@context": "https://schema.org/",
        "@type": "Product",
        "name": product.productTitle,
        "offers": {
            "price": product.productPrice,
            "priceCurrency": config.currencyISO,
            "availability": product.productStock ?? 0 > 0 ? "https://schema.org/InStock" : "https://schema.org/SoldOut",
            "url": pageUrl
        },
        "sku": productId,
        "image": pageUrl + '/image',
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": reviews?.average ?? 0,
            "reviewCount": reviews?.count ?? 0
        },
        "url": pageUrl,
    };
    if (product.productGtin) {
        ldJson.gtin = product.productGtin;
    }
    if (product.productBrand) {
        ldJson.brand = {
            "@type": "Organization",
            "name": product.productBrand,
        };
    }
    if (reviews && reviews.count > 0) {
        ldJson.review = {
            "@type": "Review",
            "reviewRating": {
                "@type": "Rating",
                "ratingValue": reviews.featured.review.rating,
                "bestRating": reviews.highestRating
            },
            "author": {
                "@type": "Person",
                "name": `${reviews.featured.customer?.firstName} ${reviews.featured.customer?.lastName}`.trim()
            }
        };
    }
    if (product.productDescription) {
        ldJson.description = snip(product.productDescription);
    }
    
    return <Template>
        <FrontMenu />
        <section>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(ldJson) }}
            />
        </section>
        <div className='flex-none basis-full sm:basis-2/3 sm:mx-auto pt-8'>
            <div className='flex flex-wrap gap-y-8'>
                <div className='flex-none basis-full md:basis-1/2'>
                {images.length > 1 ? (
                    <ImageSlider images={images} />
                ) : (
                    <FlexImage src={`/product/${productId}/image`} alt='...' className='w-full' />
                )}
                </div>
                
                <div className='flex flex-col flex-none basis-full md:basis-1/2 md:pl-8'>
                    <h4 className='flex-none mt-0 text-[1.33rem]'>
                        {product.productTitle}
                    </h4>
                    <CartForm action={addCartItem} className='flex-none block'>
                        <input name='productId' type='hidden' value={productId} />
                        {product.variants && product.variants.length > 0 ? (
                            <Variants
                                labels={{
                                    option: lang('Option'),
                                    outOfStock: lang('Out of stock'),
                                }}
                                stockDisabled={product.productStockDisable}
                                items={product.variants}
                            />
                        ) : (<>
                            <h5 className='mb-2.5 text-neutral-500 text-[1.33rem]'>
                                {currencySymbol()}{formatAmount(product.productPrice)}
                            </h5>
                            {config.trackStock && !product.productStockDisable && (product.productStock ?? 0) < 1 && 
                            <h5 className='mb-2.5 text-center text-red-500'>{lang('Out of stock')}</h5>}
                        </>)}
                        <h5>{lang('Quantity')}</h5>
                        <Quantity />
                        {product.productComment && <>
                            <div className='mt-2.5'>{lang('Leave a comment?')}</div>
                            <TextArea name='productComment' noValidation />
                        </>}
                        <Button className='btn-primary w-full mt-2.5 mb-4'>{lang('Add to cart')}</Button>
                    </CartForm>
                    <div className='flex-none mb-4'
                        dangerouslySetInnerHTML={{__html: fixTags(product.productDescription)}}
                    ></div>
                    <div className='flex-1'></div>
                    <ReviewControls
                        productId={productId}
                        data={reviews}
                        reviewModule={modules.reviews}
                        labels={{
                            addReview: lang('Add review'),
                            openReviews: lang('Reviews'),
                            formTitle: lang('Product review'),
                            cancel: lang('Cancel'),
                            empty: lang('No review yet'),
                            title: lang('Title'),
                            desc: lang('Description'),
                            rating: lang('Rating'),
                            error: lang("Server can't process your request"),
                            titlePlaceholder: lang('Love it.'),
                            descPlaceholder: lang('Product is great. Does everything it said it can do.'),
                        }}
                    />
                </div>
            </div>

            {config.showRelatedProducts && relatedProducts && relatedProducts.length > 0 &&
            <div className='w-full mt-12'>
                <h4>{lang('Related products')}</h4>
                <div className='flex flex-wrap -mx-4'>
                    {relatedProducts.map(p => <div key={p._id.toString()}
                        className={`grow-0 shrink basis-1/4 px-4 ${p.productPermalink ? 'product-wrapper' : ''}`}
                    >
                        <Link href={`/product/${p.productPermalink || p._id.toString()}`} className='block' prefetch={false}>
                            <FlexImage src={p.productImage} alt='...' />
                            <h5 className='text-center mt-2.5'><Ellipsis>{p.productTitle}</Ellipsis></h5>
                        </Link>
                        <h5 className='w-full text-center text-neutral-500'>{currencySymbol()}{formatAmount(p.productPrice)}</h5>
                        <p className='text-center mb-2.5'>
                            <Link href={`/product/${p.productPermalink || p._id.toString()}`} className='btn btn-primary'>{lang('View')}</Link>
                        </p>
                    </div>)}
                </div>
            </div>}
        </div>
    </Template>;
}