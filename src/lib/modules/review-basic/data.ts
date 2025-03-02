/** 
 * https://github.com/atmulyana/nextCart
 **/
import fn, {type Db, getPagedList, ObjectId, paging, toId} from '@/data/db-conn';
import type {_Id, TCustomer, WithId} from '@/data/types';
import currentLocale from '@/lib/currentLocale/server';
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
    search?: ObjectId | string,
    pageIdx: number = 1,
    limit?: number
) => {
    if (search instanceof ObjectId) {
        const pList = await getPagedList(
            db.collection("reviews").aggregate<TReviewList['reviews'][0]>([
                {
                    $match: {product: search}
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
            pageIdx,
            limit
        );

        const {list: reviews, isNext, page} = pList;
        
        const locale = currentLocale();
        for (let i = 0; i < reviews.length; i++) {
            reviews[i].timeAgo = timeAgo(reviews[i].date, locale);
        }

        return {
            reviews,
            isNext,
            page,
        };
    }
    else if (['string', 'undefined'].includes(typeof(search))) {
        const ratingRegex = /^[1-5]$/;
        const query: {[f: string]: any} = {};
        const s = search?.trim();
        if (s) {
            const words = s.split(/\s+/);
            const ratings: Array<number> = [];
            for (let word of words) {
                if (ratingRegex.test(word)) ratings.push(parseInt(word));
                
            }
            const $text = {$search: words.join(' ')};
            const rating = (ratings.length == 1) ? ratings[0] :
                           (ratings.length > 1)  ? {$in: ratings} :
                           null;
            if (rating) {
                query.$or = [
                    {rating},
                    {$text}
                ];
            }
            else {
                query.$text = $text;
            }
        }
        const rs = db.find<TReview>('reviews', query);
        return (await paging(rs, limit, pageIdx, {date: -1}));
    }
    else {
        return null as never;
    }
}) as <T extends ObjectId | string>(search?: T, pageIdx?: number, limit?: number) => Promise<
    T extends ObjectId             ? TReviewList :
    T extends (string | undefined) ? Awaited< ReturnType< typeof paging<WithId<TReview>> > > :
                                     never 
>;

export const getReviewSummary = fn(async (
    db: Db,
    productId: ObjectId
) => {
    let summary = (await db.collection("reviews").aggregate<TReviewSummary>([
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
    if (!summary) {
        summary = {
            highestRating: 0,
            average: 0,
            count: 0,
            featured: {
                review:  {
                    title: '',
                    description: '',
                    rating: 0,
                    date: new Date(),
                },
                customer: null,
            }
        }
    }
    return summary;
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

export const deleteReview = fn(async (
    db: Db,
    id: _Id
) => {
    return (await db.collection('reviews').deleteOne({_id: toId(id)})).deletedCount > 0;
});