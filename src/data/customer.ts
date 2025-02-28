/** 
 * https://github.com/atmulyana/nextCart
 **/
import {emailRegex, nameRegex, phoneRegex, sanitizePhone} from '@/lib/common';
import type {_Id, TCart, TCartItem, TCustomer, TSession, WithoutId} from './types';
import fn, {type Db, paging, toId} from './db-conn';

function phone(customer: TCustomer | null) {
    if (customer?.phone && !customer.phone.startsWith('0')) {
        customer.phone = '+' + customer.phone;
    }
    return customer;
}

export const getCustomer = fn(async (db: Db, id: _Id) => {
    return phone( await db.collection<TCustomer>('customers').findOne({_id: toId(id)}) );
});

export const getCustomerByEmail = fn(async (db: Db, email: string) => {
    return phone( await db.collection<TCustomer>('customers').findOne({email}) );
});

export const getCustomerByResetToken = fn(async (db: Db, token: string) => {
    return await db.collection<TCustomer>('customers').findOne({resetToken: token, resetTokenExpiry: {$gt: Date.now()}});
});

export const getCustomersByName = fn(async (db: Db, name: string, limit: number = 0) => {
    const $regex = new RegExp(name, 'i');
    let rs = db.collection<TCustomer>('customers').find({
        $or: [
            { firstName: { $regex } },
            { lastName: { $regex } },
        ]
    });
    if (limit > 0) rs = rs.limit(limit);
    return await rs.toArray();
});

export const getCustomers = fn(async (db: Db, {
    search,
    page,
    limit,
    sort = {orderDate: -1},
} : {
    search?: string,
    page?: number,
    limit?: number,
    sort?: {[f: string]: 1|-1}
}) => {
    const query: {[f: string]: any} = {};
    search = search?.trim();
    if (search) {
        const words = search.trim().split(/\s+/);
        const emails: Array<string> = [], names: Array<string> = [], phones: Array<string> = [];
        for (let word of words) {
            if (emailRegex.test(word)) emails.push(word);
            else if (nameRegex.test(word)) names.push(word);
            else if (phoneRegex.test(word)) phones.push(sanitizePhone(word));
        }
        
        if (emails.length == 1) query.email = emails[0]
        else if (emails.length > 1) query.email = {$in: emails};
        
        if (names.length > 0) query.$text = {$search: names.join(' ')};

        if (phones.length == 1) query.phone = phones[0]
        else if (phones.length > 1) query.phone = {$in: phones};
    }
    const rs = db.find<TCustomer>('customers', query);
    const list = await paging(rs, limit, page, sort);
    list.data.forEach(c => phone(c));
    return list;
});

export const createCustomer = fn(async (db: Db, customer: WithoutId<TCustomer>) => {
    customer.phone = sanitizePhone(customer.phone);
    const w = await db.collection('customers').insertOne(customer);
    return w.insertedId;
});

type OptionalCustomerFields = keyof {
    [F in keyof TCustomer as ({} extends Pick<TCustomer, F> ? F : never)]: TCustomer[F]
};

export const updateCustomer = fn(async (
    db: Db,
    id: _Id,
    customer: Partial<WithoutId<TCustomer>>,
    deletedFields: Array<OptionalCustomerFields> = []
) => {
    const _id = toId(id);
    if (_id) {
        const $unset = deletedFields.reduce(
            (obj, field) => (obj[field] = '', obj),
            {} as {[F in OptionalCustomerFields]?: ''}
        );
        if (customer.phone) customer.phone = sanitizePhone(customer.phone);
        const updates: {$set?: typeof customer, $unset?: typeof $unset} = {};
        if (Object.keys(customer).length > 0) updates.$set = customer;
        if (Object.keys($unset).length > 0) updates.$unset = $unset;
    
        await db.collection('customers').updateOne(
            {_id},
            updates
        );
    }
});

export const deleteCustomer = fn(async (db: Db, customerId: _Id) => {
    const id = toId(customerId);
    if (!id) return false;

    const sessionIds = await db.collection<TSession>('sessions').distinct('_id', {customerId: id});
    await db.collection<TCartItem>('cartItems').deleteMany({'_id.cartId': {$in: sessionIds}});
    await db.collection<TCart>('cart').deleteMany({_id: {$in: sessionIds}});
    await db.collection<TSession>('sessions').deleteMany({_id: {$in: sessionIds}});

    await db.collection('reviews').deleteMany({customer: id});
    const w = await db.collection('customers').deleteOne({_id: id});
    return w.deletedCount;
});