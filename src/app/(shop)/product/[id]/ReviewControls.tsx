"use client";
/** 
 * https://github.com/atmulyana/nextCart
 **/
import React from 'react';
import {createPortal} from 'react-dom';
import Link from 'next/link';
import {usePathname, useRouter} from 'next/navigation';
import {useSession} from '@/components/SessionContext';
import {useModal} from '@/components/Modal';
import type {NotificationParam} from '@/components/Notification';
import Icon from '@/components/Icon';
import type {TModules} from '@/lib/modules';
import type {Return} from './data/route';

type TResponse = {
    type: NotificationParam['type'],
    data?: any
};

const ReviewControls = React.memo(function ReviewControls({
    productId,
    data,
    reviewModule,
    labels: {
        addReview,
        openReviews,
        formTitle = 'Product review',
        cancel = 'Cancel',
        empty,
        title,
        desc,
        rating,
        error,
        titlePlaceholder,
        descPlaceholder,
    }
}: {
    productId: string,
    data?: Return['reviews'],
    reviewModule: TModules['reviews'],
    labels: {
        addReview: string,
        openReviews: string,
        formTitle?: string,
        cancel?: string,
        empty?: string,
        title?: string,
        desc?: string,
        rating?: string,
        error?: string,
        titlePlaceholder?: string,
        descPlaceholder?: string,
    }
}) {
    const ctlCont = React.useRef<HTMLDivElement>(null);
    const [reviews, setReviews] = React.useState(data);
    const [openReview, setOpenReview] = React.useState(false);
    const [reviewsCont, setReviewsCont] = React.useState<HTMLDivElement | null>(null);
    const formRef = React.useRef<HTMLFormElement>(null);
    const pathname = usePathname();
    const router = useRouter();
    const session = useSession();
    const openModal = useModal();

    React.useEffect(() => {
        const _reviewsCont = document.createElement('div');
        _reviewsCont.classList.add('flex-none', 'basis-full', 'hidden');
        (ctlCont.current?.parentNode as Element)?.after(_reviewsCont);
        setReviewsCont(_reviewsCont);
        return () => _reviewsCont.remove();
    }, []);

    React.useEffect(() => {
        if (openReview) {
            reviewsCont?.classList.replace('hidden', 'block');
        }
        else {
            reviewsCont?.classList.replace('block', 'hidden');
        }
    }, [openReview, reviewsCont]);

    if (!reviewModule) return null;
    const {RatingStars, Reviews, ReviewForm} = reviewModule;

    return <>
        <div ref={ctlCont} className='flex justify-between items-center flex-none'>
            <button
                className='btn-primary'
                onClick={async () => {
                    if (session?.customerPresent) {
                        let resolveSubmit: ((response: TResponse) => void) | undefined;
                        await openModal({
                            title: formTitle,
                            content: <ReviewForm
                                ref={formRef}
                                productId={productId}
                                labels={{
                                    title,
                                    desc,
                                    rating,
                                    titlePlaceholder,
                                    descPlaceholder,
                                }}
                                loadingCallback={openModal.setLoading}
                                onSubmitted={response => resolveSubmit && resolveSubmit(response)}
                            />,
                            okLabel: addReview,
                            okBtnStyle: 'btn-outline-success',
                            cancelLabel: cancel,
                            cancelBtnStyle: 'btn-outline-danger',
                            size: 'lg',
                            onOk: async () => {
                                if (formRef.current) {
                                    return await new Promise<TResponse>(resolve => {
                                        resolveSubmit = resolve;
                                        formRef.current?.requestSubmit();
                                    }).then(response => {
                                        if (response.type == 'danger') return false;
                                        setReviews(response.data);
                                    });
                                }
                            },
                        });
                    }
                    else {
                        router.push('/customer/login?referrerUrl=' + encodeURIComponent(pathname));
                    }
                }}
            >
                {addReview}
            </button>
            <RatingStars rating={reviews?.average ?? 0} />
            <Link href='#' onClick={e => {
                e.preventDefault();
                setOpenReview(open => !open);
            }}>
                {openReviews}
                <Icon name={openReview ? 'chevrons-up' : 'chevrons-down'} />
            </Link>
        </div>
        {reviewsCont && reviewsCont.parentNode && createPortal(
            <Reviews
                {
                    ...{
                        productId,
                        data: reviews,
                        labels: {
                            empty,
                            title,
                            desc,
                            rating,
                            error,
                        }
                    }
                }
            />,
            reviewsCont
        )}
    </>;
});
export default ReviewControls;