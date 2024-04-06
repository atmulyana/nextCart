'use client';
/** 
 * https://github.com/atmulyana/nextCart
 **/
import React from 'react';
import Loading from '@/components/Loading';
import {useNotification} from '@/components/Notification';
import {isPlainObject} from '@/lib/common';
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
        error = 'Error',
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
    const [loading, setLoading] = React.useState<-1|0|1>(0);
    const isLoading = React.useCallback(() => loading != 0, [loading]);
    const notify = useNotification();

    React.useEffect(() => {
        setList(data);
    }, [data]);

    React.useEffect(() => {
        if (loading != 0) {
            const page = list ? (loading < 0 ? list.page - 1 : list.page + 1) : 1;
            fetch(`/product/${productId}/reviews/${page}`)
            .then(response => {
                if (!response.ok) throw response;
                return response.json();
            })
            .then(list => {
                setList(list);
            })
            .catch(response => {
                let isNotified = false;

                const showNotification = (data: any) => {
                    if (typeof(data.message) == 'string') {
                        notify(data.message, data.messageType || 'danger');
                        isNotified = true;
                    }
                }

                if (response instanceof Response) {
                    response.json().then(data => {
                        showNotification(data);
                    }).catch(() => {
                        //ignores errors
                    })
                }
                else if (isPlainObject(response)) {
                    showNotification(response);
                }
                if (!isNotified) {
                    notify(error, 'danger');
                }
            })
            .finally(() => {
                setLoading(0);
            });
        }
    }, [loading]);
    
    return <div className='relative w-full'>
        {list === data && (!data || data.reviews.length < 1) ? (
            <p className='text-center border border-[rgba(0,0,0,.25)] dark:border-[rgba(255,255,255,.25)] rounded py-3 px-5'>
                {empty}
            </p>
        ) : (
            <ul className='list-none flex flex-col w-full'>
                {list?.reviews.map((r, idx) =>
                <li key={idx} className={`block border border-[rgba(0,0,0,.25)] dark:border-[rgba(255,255,255,.25)] py-3 px-5 ${
                    idx == 0 ? 'rounded-t' : 'border-t-0'
                } ${
                    idx == list?.reviews.length-1 ? 'rounded-b' : ''
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

        {(list?.isNext || list?.page && list.page > 1) && <div className='flex justify-center gap-2 w-full mt-2'>
            <button
                className='btn-outline-primary'
                disabled={list.page < 2}
                onClick={() => {
                    setLoading(-1);
                }}
            >&laquo;</button>
            <button
                className='btn-outline-primary'
                disabled={!list.isNext}
                onClick={() => {
                    setLoading(1);
                }}
            >&raquo;</button>
        </div>}
        
        <Loading isLoading={isLoading} />
    </div>;
});
export default Reviews;