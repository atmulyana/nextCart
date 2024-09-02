/** 
 * https://github.com/atmulyana/nextCart
 **/
import type {_Id, TOrder} from '@/data/types';
import fn, {type Db, toId} from './db-conn';

export const createOrder = fn(async (db: Db, order: TOrder) => {
    const result = await db.collection('orders').insertOne(order);
    return result.insertedId;
});

export const updateOrder = fn(async (db: Db, id: _Id, order: Partial<TOrder>) => {
    await db.collection('orders').updateOne(
        {_id: toId(id)},
        order
    );
});

export const getOrder = fn(async (db: Db, id: _Id) => {
    return await db.collection<TOrder>('orders').findOne({_id: toId(id)});
});
