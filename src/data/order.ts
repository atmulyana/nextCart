/** 
 * https://github.com/atmulyana/nextCart
 **/
import type {_Id, TOrder, WithoutId} from '@/data/types';
import fn, {type Db, getPagedList, toId} from './db-conn';

export const createOrder = fn(async (db: Db, order: WithoutId<TOrder>) => {
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

export const getOrders = fn(async (
    db: Db,
    customerId: _Id | undefined,
    pageIdx: number = 1
) => {
    const id = toId(customerId);
    if (!id) {
        return {
            list: [] as TOrder[],
            isNext: false,
            page: 1,
        };
    }
   
    return await getPagedList(
        db.collection("orders").aggregate<TOrder>([
            {
                $match: {orderCustomer: id}
            },
            {
                $sort: {
                    orderDate: -1,
                },
            },
        ]),
        pageIdx
    );
});
