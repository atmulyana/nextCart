'use client';
/** 
 * https://github.com/atmulyana/nextCart
 **/
import React from 'react';
import PagedList from '@/subview/components/PagedList';
import type {TReviewList} from './data';
import RatingStars from './RatingStars';

const Reviews = React.memo(function Reviews({
    productId,
    data,
    labels: {
        empty = 'No review',
        title,
        desc,
        rating,
    } = {}
}: {
    productId: string,
    data?: TReviewList,
    labels?: {
        empty?: string,
        title?: string,
        desc?: string,
        rating?: string,
        error?: string,
    }
}) {
    const [list, setList] = React.useState(data);

    React.useEffect(() => {
        setList(data);
    }, [data]);
    
    return <PagedList url={`/product/${productId}/reviews`} list={list} setList={setList}>
        {list === data && (!data || data.reviews.length < 1) ? (
            <p className='text-center border border-[rgba(0,0,0,.25)] dark:border-[rgba(255,255,255,.25)] rounded-sm py-3 px-5'>
                {empty}
            </p>
        ) : (
            <ul className='list-none flex flex-col w-full'>
                {list?.reviews.map((r, idx) =>
                <li key={idx} className={`block border border-[rgba(0,0,0,.25)] dark:border-[rgba(255,255,255,.25)] py-3 px-5 ${
                    idx == 0 ? 'rounded-t-sm' : 'border-t-0'
                } ${
                    idx == list?.reviews.length-1 ? 'rounded-b-sm' : ''
                }`}>
                    <p className='text-right text-neutral-500 text-sm'>{r.timeAgo}</p>
                    <p className='flex flex-wrap w-full'>
                        <span className='flex-auto'>{
                            title
                                ? <><b>{title}:</b> {r.title}</> 
                                : <b>{r.title}</b>
                        } </span>
                        <span className='flex-none flex items-center gap-1'>
                            {rating ? <b>{rating}:</b> : <></>}
                            <span className='inline-flex'><RatingStars rating={r.rating} /></span>
                        </span>
                    </p>
                    <p>
                        {desc ? <><b>{desc}:</b><br/></> : <></>}
                        {r.description}
                    </p>
                </li>)}
            </ul>
        )}
    </PagedList>;
});
export default Reviews;