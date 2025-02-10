/** 
 * https://github.com/atmulyana/nextCart
 **/
import type {_Id, TCustomer, WithoutId} from './types';
import fn, {type Db, toId} from './db-conn';

export const getCustomer = fn(async (db: Db, id: _Id) => {
    return await db.collection<TCustomer>('customers').findOne({_id: toId(id)});
});

export const getCustomerByEmail = fn(async (db: Db, email: string) => {
    return await db.collection<TCustomer>('customers').findOne({email});
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

export const createCustomer = fn(async (db: Db, customer: WithoutId<TCustomer>) => {
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
        const updates: {$set?: typeof customer, $unset?: typeof $unset} = {};
        if (Object.keys(customer).length > 0) updates.$set = customer;
        if (Object.keys($unset).length > 0) updates.$unset = $unset;
    
        await db.collection('customers').updateOne(
            {_id},
            updates
        );
    }
});