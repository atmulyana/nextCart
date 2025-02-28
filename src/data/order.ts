/** 
 * https://github.com/atmulyana/nextCart
 **/
import type {_Id, OrderStatus, TOrder, WithoutId} from '@/data/types';
import {emailRegex, getOrderStatuses, nameRegex, postalCodeRegex} from '@/lib/common';
import fn, {type Db, getPagedList, paging, toId} from './db-conn';

export const createOrder = fn(async (db: Db, order: WithoutId<TOrder>) => {
    const result = await db.collection('orders').insertOne(order);
    return result.insertedId;
});

export const updateOrder = fn(async (db: Db, id: _Id, order: Partial<TOrder>) => {
    await db.collection('orders').updateOne(
        {_id: toId(id)},
        {$set: order},
    );
});

export const updateOrderStatus = fn(async (db: Db, id: _Id, status: OrderStatus) => {
    if (!getOrderStatuses().includes(status)) throw 'Invalid status';
    return (await db.collection<TOrder>('orders').updateOne(
        {_id: toId(id)},
        {$set: {orderStatus: status}},
    )).modifiedCount > 0;
});

export const deleteOrder = fn(async (db: Db, id: _Id) => {
    /** TODO: should reverse the product stock, perhaps for 'Pending' status */
    return (await db.collection('orders').deleteOne({_id: toId(id)})).deletedCount > 0;
});

export const getOrder = fn(async (db: Db, id: _Id) => {
    return await db.collection<TOrder>('orders').findOne({_id: toId(id)});
});

export const getOrders = fn(async (db: Db, {
    search,
    status,
    page,
    limit,
    sort = {orderDate: -1},
} : {
    search?: string,
    status?: OrderStatus,
    page?: number,
    limit?: number,
    sort?: {[f: string]: 1|-1}
}) => {
    const query: {[f: string]: any} = {};
    search = search?.trim();
    if (search) {
        const words = search.trim().split(/\s+/);
        const emails: Array<string> = [], names: Array<string> = [], zips: Array<string> = [];
        for (let word of words) {
            if (emailRegex.test(word)) emails.push(word);
            else if (nameRegex.test(word)) names.push(word);
            else if (postalCodeRegex.test(word)) zips.push(word);
        }
        
        if (emails.length == 1) query.orderEmail = emails[0]
        else if (emails.length > 1) query.orderEmail = {$in: emails};
        
        if (names.length > 0) query.$text = {$search: names.join(' ')};

        if (zips.length == 1) query.orderPostcode = zips[0]
        else if (zips.length > 1) query.orderPostcode = {$in: zips};
    }
    if (status) {
        query.orderStatus = status;
    }
    const rs = db.find<TOrder>('orders', query);
    return paging(rs, limit, page, sort);
});

export const getOrdersByEmail = fn(async (db: Db, email: string, page?: number, limit?: number) => {
    const rs = db.find<TOrder>('orders', {orderEmail: email});
    return  paging(rs, limit, page);
});

export const getOrdersByValue = fn(async (db: Db, value: number, page?: number, limit?: number) => {
    const rs = db.find<TOrder>('orders', {orderTotal: value});
    return paging(rs, limit, page);
});

export const getOrdersByName = fn(async (db: Db, name: string, page?: number, limit?: number) => {
    const $regex = new RegExp(name, 'i');
    const rs = db.find<TOrder>('orders', {
        $or: [
            { orderFirstname: { $regex } },
            { orderLastname: { $regex } },
        ]
    });
    return paging(rs, limit, page);
});

export const getOrdersByCustomerId = fn(async (
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

export const getOrderSummary = fn(async (db: Db) => {
    const orders = db.collection("orders");
    const orderCount = await orders.countDocuments({});
    const orderAmounts = await orders.aggregate([
        { $match: {} },
        { 
            $group: {
                _id: null,
                sum: { $sum: '$orderTotal' }
            }
        }
    ]).toArray();
    const productsSolds = await orders.aggregate([
        { $match: {} },
        { 
            $group: {
                _id: null,
                sum: { $sum: '$orderProductCount' }
            }
        }
    ]).toArray();
    const topProducts = await orders.aggregate([
        {
            $project: { _id: 0 }
        },
        {
            $project: {
                o: { $objectToArray: '$orderProducts' } 
            }
        },
        {
            $unwind: '$o'
        },
        {
            $group: {
                _id: '$o.v.productId',
                title: { $last: '$o.v.title' },
                count: { $sum: '$o.v.quantity' },
            } 
        },
        { 
            $sort: { count: -1 }
        },
        { 
            $limit: 5
        }
    ]).toArray();

    return {
        orderCount,
        orderAmount: orderAmounts.length > 0 ? orderAmounts[0].sum : 0,
        productsSold: productsSolds.length > 0 ? productsSolds[0].sum : 0,
        topProducts,
    };
});