/** 
 * https://github.com/atmulyana/nextCart
 **/
import type {_Id, TCustomer, WithoutId} from './types';
import fn, {type Db, toId} from './db-conn';

export const getCustomerByEmail = fn(async (db: Db, email: string) => {
    return await db.collection<TCustomer>('customers').findOne({email});
});

export const createCustomer = fn(async (db: Db, customer: WithoutId<TCustomer>) => {
    const w = await db.collection('customers').insertOne(customer);
    return w.insertedId;
});

export const updateCustomer = fn(async (db: Db, id: _Id, customer: Partial<WithoutId<TCustomer>>) => {
    const _id = toId(id);
    if (_id) await db.collection('customers').updateOne(
        {_id},
        {$set: customer}
    );
});