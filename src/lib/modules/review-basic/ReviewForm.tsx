'use client';
/** 
 * https://github.com/atmulyana/nextCart
 **/
import './styles.css';
import React from 'react';
import FormWithSchema from '@/components/FormWithSchema';
import Input from '@/components/SubmittedInput';
import TextArea from '@/components/SubmittedTextArea';
import {addReview} from '@/app/actions';
import RatingStars from './RatingStars';

const ReviewForm = React.forwardRef<
    HTMLFormElement,
    {
        productId: string,
        labels?: {
            title?: string,
            desc?: string,
            rating?: string,
            titlePlaceholder?: string,
            descPlaceholder?: string,
        },
        loadingCallback?: (isLoading: boolean) => any,
        onSubmitted?: React.ComponentProps<typeof FormWithSchema>['onSubmitted']
    }
>(function ReviewForm(
    {
        productId,
        labels: {
            title = 'Title',
            desc = 'Description',
            rating: ratingText = 'Rating',
            titlePlaceholder = 'Love it.',
            descPlaceholder = 'Product is great. Does everything it said it can do.',
        } = {},
        loadingCallback,
        onSubmitted,
    },
    ref
) {
    const [rating, setRating] = React.useState(0);
    React.useEffect(() => {
        window.__lang__.title = title.toLowerCase();
        window.__lang__.description = desc.toLowerCase();
    }, [title, desc]);

    return <FormWithSchema
        ref={ref}
        action={addReview}
        className='block p-4'
        loadingCallback={loadingCallback}
        onSubmitted={onSubmitted}
        schemaName='review'
    >
        <Input type='hidden' name='product' value={productId} />
        <div className='mb-4'>
            <label htmlFor='title'>{title}:&nbsp;</label>
            <Input name='title' placeholder={titlePlaceholder} />
        </div>
        <div className='mb-4'>
            <label htmlFor='description'>{desc}:</label>
            <TextArea name='description' rows={5} placeholder={descPlaceholder} />
        </div>
        <div className='flex flex-wrap items-center mb-4'>
            <label className='flex-none'>{ratingText}:&nbsp;</label>
            <div className='relative flex-auto'>
                <Input 
                    className='flex-none !inline !border-transparent !w-14 opacity-0'
                    name='rating'
                    type='number'
                    readOnly
                    value={rating}
                />
                <div className='absolute bottom-0 top-0 left-0 right-0 flex items-center z-10'>
                    <RatingStars className='flex-none' rating={rating} onClick={rating => setRating(rating)} />
                </div>
            </div>
        </div>
    </FormWithSchema>;
});
export default ReviewForm;