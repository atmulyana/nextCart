'use client';
/** 
 * https://github.com/atmulyana/nextCart
 **/
import React from 'react';
import FormWithSchema from '@/subview/components/FormWithSchema';
import Input from '@/subview/components/SubmittedInput';
import TextArea from '@/subview/components/SubmittedTextArea';
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
        onSubmitted,
    },
    ref
) {
    const [rating, setRating] = React.useState(0);

    return <FormWithSchema ref={ref} action={addReview} className='block p-4' onSubmitted={onSubmitted} schemaName='review'>
        <input type='hidden' name='product' value={productId} />
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
                <Input className='flex-none !inline !border-transparent !w-14 opacity-0' name='rating' value={rating} />
                <div className='absolute bottom-0 top-0 left-0 right-0 flex items-center z-10'>
                    <RatingStars className='flex-none' rating={rating} onClick={rating => setRating(rating)} />
                </div>
            </div>
        </div>
    </FormWithSchema>;
});
export default ReviewForm;