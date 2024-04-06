/** 
 * https://github.com/atmulyana/nextCart
 **/
import type {TDiscount} from './types';
import fn, {type Db} from './db-conn';

export const getDiscountByCode = fn(async (db: Db, code: string) => {
    return await db.collection<TDiscount>('discounts').findOne(
        {code},
        {
            projection: {
                _id: 0
            }
        }
    );
});