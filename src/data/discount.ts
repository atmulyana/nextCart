/** 
 * https://github.com/atmulyana/nextCart
 **/
import config from '@/config';
import type {_Id, TDiscount, WithId} from './types';
import fn, {type Db, toId} from './db-conn';

export const getDiscount = fn(async (db: Db, id: _Id) => {
    return await db.collection<TDiscount>('discounts').findOne({_id: toId(id)});
});

export const getDiscountByCode = fn(async (db: Db, code: string, notId?: _Id) => {
    return await db.collection<TDiscount>('discounts').findOne(
        {
            code,
            _id: {$ne: toId(notId)}
        },
        {
            projection: {
                _id: 0
            }
        }
    );
});

export const getDiscounts = fn(async (
    db: Db,
    page: number = 1,
    numberOfItems: number = config.itemsPerPage,
    includeTotalNumber: boolean = true
) => {
    let skip = 0;
    if(page > 1){
        skip = (page - 1) * numberOfItems;
    }
    const discounts = db.collection<WithId<TDiscount>>('discounts');
    const data = await discounts.aggregate<WithId<TDiscount>>([
        {
            $sort: {code: 1},
        },
        {
            $skip: skip
        },
        {
            $limit: numberOfItems,
        },
    ]).toArray();
    const totalItems = includeTotalNumber ? await discounts.countDocuments() : -1;

    return {
        data,
        itemsPerPage: numberOfItems,
        totalItems,
    };
});

export const addDiscount = fn(async (db: Db, discount: TDiscount) => {
    return (await db.collection<typeof discount>('discounts').insertOne(discount)).insertedId;
});

export const updateDiscount = fn(async (db: Db, id: _Id, discount: TDiscount) => {
    return (await db.collection<typeof discount>('discounts').updateOne(
        {_id: toId(id)},
        {$set: discount}
    )).modifiedCount > 0;
});

export const deleteDiscount = fn(async (db: Db, id: _Id) => {
    return (await db.collection('discounts').deleteOne({_id: toId(id)})).deletedCount > 0;
});