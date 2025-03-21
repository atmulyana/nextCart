/** 
 * https://github.com/atmulyana/nextCart
 **/
import type {Session} from 'next-auth';
import {getSessionToken} from '@/lib/auth';
import {sanitizePhone} from '@/lib/common';
import fn, {type Db, ObjectId, toId} from './db-conn';
import {TSession} from './types';
import type {_Id, TSessionBasic, TSessionCustomer, TSessionUser, WithoutId} from './types';

export async function getSessionId() {
    const session = await getSessionToken();
    return session?.id ? ObjectId.createFromBase64(session.id) : null;
}

export const refreshSessionExpires = fn(async (db: Db, expires?: Date, sessId?: string) => {
    let token: Session | null = null;
    if (!sessId && (token = await getSessionToken())) {
        sessId = token.id;
        if (!expires) expires = new Date(token.expires);
    }
    const sessionId = sessId ? ObjectId.createFromBase64(sessId) : null;
    let isNew: boolean | undefined;
    if (sessionId && expires) {
        const w = await db.collection<TSessionBasic>('sessions').updateOne(
            {_id: sessionId},
            {
                $set: {
                    expires
                }
            },
            {
                upsert: true,
            }
        );
        isNew = w.upsertedCount > 0;
    }
    return {
        sessionId,
        isNew,
        token,
    };
});

export const getSession = fn(async (db: Db) => {
    const sessions = db.collection<TSession>('sessions');
    const sessionId = await getSessionId();
    let session: TSession | undefined;
    if (sessionId) {
        session = (await sessions.aggregate<TSession>([
            {
                $match: {
                    _id: sessionId
                }
            },
            {
                $lookup: {
                    from: "customers",
                    localField: "customerId",
                    foreignField: "_id",
                    as: "customers"
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "users"
                }
            },
            {
                $replaceRoot: {
                    newRoot: {
                        $mergeObjects: [
                            { $arrayElemAt: [ "$customers", 0 ] },
                            { $arrayElemAt: [ "$users", 0 ] },
                            "$$ROOT"
                        ]
                    }
                }
            },
            {
                $project: {
                    expires: 1,
                    //customers: 0,
                    customerId: '$customerId',
                    customerEmail: { $ifNull: [ '$customerEmail', '$email' ] },
                    customerCompany: { $ifNull: [ '$customerCompany', '$company' ] },
                    customerFirstname: { $ifNull: [ '$customerFirstname', '$firstName' ] },
                    customerLastname: { $ifNull: [ '$customerLastname', '$lastName' ] },
                    customerAddress1: { $ifNull: [ '$customerAddress1', '$address1' ] },
                    customerAddress2: { $ifNull: [ '$customerAddress2', '$address2' ] },
                    customerCountry: { $ifNull: [ '$customerCountry', '$country' ] },
                    customerState: { $ifNull: [ '$customerState', '$state' ] },
                    customerPostcode: { $ifNull: [ '$customerPostcode', '$postcode' ] },
                    customerPhone: { $ifNull: [ '$customerPhone', '$phone' ] },
                    //users: 0,
                    userId: '$userId',
                    user: '$userEmail',
                    usersName: '$usersName',
                    isAdmin: '$isAdmin',
                    isOwner: '$isOwner',
                }
            },
        ])
        .toArray())[0];
    }
    
    if (session) {
        Object.setPrototypeOf(session, new TSession());
        if (session.customerPhone && !session.customerPhone.startsWith('0')) session.customerPhone = '+' + session.customerPhone;
        return session;
    }
    return new TSession();
});

export const setCustomerSession = fn(async (db: Db, data: _Id | WithoutId<TSessionCustomer>) => {
    const {sessionId} = await refreshSessionExpires(); //creates session if not exists
    if (sessionId) {
        let $set: WithoutId<TSessionCustomer> = {};
        const updates: any[] = [];
        if (data instanceof ObjectId || typeof(data) == 'string') {
            $set.customerId = toId(data);
            updates.push({
                $unset: [
                    "customerEmail",
                    "customerCompany",
                    "customerFirstname",
                    "customerLastname",
                    "customerAddress1",
                    "customerAddress2",
                    "customerCountry",
                    "customerState",
                    "customerPostcode",
                    "customerPhone",
                ]
            });
        }
        else {
            if (data.customerPhone) data.customerPhone = sanitizePhone(data.customerPhone);
            $set = data;
        }
        updates.unshift({$set});
        const w = await db.collection<TSessionCustomer>('sessions').updateOne(
            {_id: sessionId},
            updates
        );
        return w.modifiedCount > 0;
    }
    return false;
});

export const clearCustomerSession = fn(async (db: Db) => {
    const sessionId = await getSessionId();
    if (sessionId) {
        const w = await db.collection<TSessionCustomer>('sessions').updateOne(
            {_id: sessionId},
            {
                $unset: {
                    customerId: "",
                    customerEmail: "",
                    customerCompany: "",
                    customerFirstname: "",
                    customerLastname: "",
                    customerAddress1: "",
                    customerAddress2: "",
                    customerCountry: "",
                    customerState: "",
                    customerPostcode: "",
                    customerPhone: "",
                }
            }
        );
        return w.modifiedCount > 0;
    }
    return false;
});

export const setUserSession = fn(async (db: Db, userId: ObjectId) => {
    const {sessionId} = await refreshSessionExpires(); //creates session if not exists
    if (sessionId) {
        const w = await db.collection<TSessionUser>('sessions').updateOne(
            {_id: sessionId},
            {
                $set: {
                    userId
                }
            }
        );
        return w.modifiedCount > 0;
    }
    return false;
});

export const clearUserSession = fn(async (db: Db) => {
    const sessionId = await getSessionId();
    if (sessionId) {
        const w = await db.collection<TSessionUser>('sessions').updateOne(
            {_id: sessionId},
            {
                $unset: {
                    userId: ""
                }
            }
        );
        return w.modifiedCount > 0;
    }
    return false;
});

export const deleteExpiredSessions = fn(async (db: Db) => {
    const sessions = db.collection<TSession>('sessions');
    const expiredIds = await sessions.distinct('_id', {expires: {$lt: new Date()}});
    await db.collection('cartItems').deleteMany({
        '_id.cartId': {$in: expiredIds}
    });
    await db.collection('cart').deleteOne({
        _id: {$in: expiredIds}
    });
    await sessions.deleteMany({
        _id: {$in: expiredIds}
    });
});