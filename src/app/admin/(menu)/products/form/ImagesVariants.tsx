'use client';
/** 
 * https://github.com/atmulyana/nextCart
 **/
import React from 'react';
import Images from './Images';
import Variants from './Variants';

type ImagesProps = React.ComponentProps<typeof Images>;
type VariantsProps = React.ComponentProps<typeof Variants>;
type Props = Omit<ImagesProps, 'texts' | 'onCountChange'> & Omit<VariantsProps, 'texts'> & {
    imageTexts: ImagesProps['texts'],
    variantTexts: VariantsProps['texts'],
};

export default function ImagesVariants({
    imageCount,
    imageTexts,
    mainIdx,
    productId,
    productPrice,
    variants,
    variantTexts,
}: Props) {
    const [imgCount, setImgCount] = React.useState(imageCount);
    const changeHandler = React.useCallback((newCount: number) => setImgCount(newCount), []);
    React.useEffect(() => {
        setImgCount(imageCount);
    }, [imageCount]);

    return <>
        <Images
            imageCount={imgCount}
            mainIdx={mainIdx}
            onCountChange={changeHandler}
            productId={productId}
            texts={imageTexts}
        />
        <Variants
            imageCount={imgCount}
            productId={productId}
            productPrice={productPrice}
            texts={variantTexts}
            variants={variants}
        />
    </>;
}