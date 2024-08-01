/** 
 * https://github.com/atmulyana/nextCart
 **/
import {TSession} from '@/data/types';
import type {TSessionBasic, TSessionCustomer, TSessionUser} from '@/data/types';
import {getSessionToken} from '@/lib/auth';
import fn, {type Db, ObjectId} from './db-conn';

export async function getSessionId() {
    const session = await getSessionToken();
    return session?.id ? ObjectId.createFromBase64(session.id) : null;
}

export const refreshSessionExpires = fn(async (db: Db, expires: Date, sessId?: string) => {
    const sessionId = sessId ? ObjectId.createFromBase64(sessId) : await getSessionId();
    let isNew: boolean | undefined;
    if (sessionId) {
        const w = await db.collection<TSessionBasic>('sessions').updateOne(
            {_id: sessionId},
            {
                $set: {
                    //_id: sessionId,
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
        isNew
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
                    blockonomicsParams: 1,
                }
            },
        ])
        .toArray())[0];
    }
    
    if (session) {
        Object.setPrototypeOf(session, new TSession());
        return session;
    }
    return new TSession();
});

export const setCustomerSession = fn(async (db: Db, data: ObjectId | Omit<TSessionCustomer, '_id'>) => {
    const sessionId = await getSessionId();
    if (sessionId) {
        let $set: Omit<TSessionCustomer, '_id'> = {};
        if (data instanceof ObjectId) $set.customerId = data;
        else $set = data;
        const w = await db.collection<TSessionCustomer>('sessions').updateOne(
            {_id: sessionId},
            {$set}
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
    const sessionId = await getSessionId();
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