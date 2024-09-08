/** 
 * https://github.com/atmulyana/nextCart
 **/
import type {TCustomer} from '@/data/types';
import fn, {type Db, getPagedList, type ObjectId, toId} from '@/data/db-conn';
import {timeAgo} from '@/lib/datetime/server';

type TReviewBase = {
    title: string,
    description: string,
    rating: number,
    customer?: ObjectId | string,
}

export type TReview = TReviewBase & {
    date: Date,
}

type TReviewDb = TReviewBase & {
    product: ObjectId,
    date?: Date,
};

export type TReviewList = {
    reviews: Array<TReview & {timeAgo?: string}>,
    isNext: boolean,
    page: number,
};

export type TReviewSummary = {
    highestRating: number,
    average: number,
    count: number,
    featured: {
        review: TReview,
        customer: TCustomer | null,
    }
}

export const getReviews = fn(async (
    db: Db,
    productId: ObjectId,
    pageIdx: number = 1
) => {
    const pList = await getPagedList(
        db.collection("reviews").aggregate<TReviewList['reviews'][0]>([
            {
                $match: {product: productId}
            },
            {
                $sort: {
                    date: -1,
                },
            },
            {
                $lookup: {
                    from: 'customers',
                    localField: 'customer',
                    foreignField: '_id',
                    as: 'customer'
                }
            },
            {
                $set: {
                    _id: {$toString: '$_id'},
                    customer: {
                        $cond: {
                            if: { $isArray: "$customer" },
                            then: {
                                $concat: [
                                    {$arrayElemAt: ["$customer.firstName", 0]},
                                    ' ',
                                    {$arrayElemAt: ["$customer.lastName", 0]}
                                ]
                            },
                            else: {
                                $cond: {
                                    if: {$eq: [{$type: '$customer'}, "string"]},
                                    then: "$customer",
                                    else: "$$REMOVE"
                                }
                            }
                        }
                    }
                }
            },
            {
                $project: {
                    product: 0,
                },
            }
        ]),
        pageIdx
    );

    const {list: reviews, isNext, page} = pList;
    
    for (let i = 0; i < reviews.length; i++) {
        reviews[i].timeAgo = timeAgo(reviews[i].date);
    }

    return {
        reviews,
        isNext,
        page,
    } as TReviewList;
});

export const getReviewSummary = fn(async (
    db: Db,
    productId: ObjectId
) => {
    return (await db.collection("reviews").aggregate<TReviewSummary>([
        {
            $match: {product: productId}
        },
        {
            $sort: {
                date: -1,
            }
        },
        {
            $group: {
                _id: "$product",
                highestRating: {$max: "$rating"},
                average: {$avg: "$rating"},
                count: {$count: {}},
                'featuredReview': {$first: "$$ROOT"}
            },
        },
        {
            $lookup: {
                from: 'customers',
                localField: 'featuredReview.customer',
                foreignField: '_id',
                as: 'featuredCustomer'
            }
        },
        {
            $project: {
                highestRating: 1,
                average: 1,
                count: 1,
                featured: {
                    review: '$featuredReview',
                    customer: {
                        $cond: {
                            if: { $isArray: "$featuredCustomer" },
                            then: {$arrayElemAt: ['$featuredCustomer', 0]},
                            else: null
                        }
                    },
                },
            }
        },
        {
            $project: {
                _id: 0,
                'featured.review._id': 0,
                'featured.review.product': 0,
                'featured.review.customer': 0,
                'featured.customer._id': 0,
            }
        }
    ]).toArray())[0];
});

export const createReview = fn(async (
    db: Db,
    review: TReviewDb
): Promise<{message: string} | true> => {
    const reviews = db.collection<TReviewDb>('reviews');
    review.customer = toId(review.customer) || review.customer;
    review.date = review.date || new Date();

    if (await reviews.countDocuments({customer: review.customer, product: review.product}) > 0) {
        return {
            message: 'Review already submitted',
        };
    }

    await reviews.insertOne(review);
    return true;
});