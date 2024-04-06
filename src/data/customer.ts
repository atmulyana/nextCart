/** 
 * https://github.com/atmulyana/nextCart
 **/
import type {TCustomer} from './types';
import fn, {type Db} from './db-conn';

export const getCustomerByEmail = fn(async (db: Db, email: string) => {
    return await db.collection<TCustomer>('customers').findOne({email});
});