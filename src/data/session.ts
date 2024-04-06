/** 
 * https://github.com/atmulyana/nextCart
 **/
import {cookies} from 'next/headers';
import {TSession} from '@/data/types';
import type {TSessionBasic, TSessionCustomer, TSessionUser} from '@/data/types';
import fn, {type Db, ObjectId} from './db-conn';
import {config} from '@/lib/session';

export function getSessionId() {
    const id = cookies().get(config.paramName)?.value;
    return id ? ObjectId.createFromBase64(id) : null;
}

export const refreshSession = fn(async (db: Db) => {
    let now = new Date();
    //now = new Date(now.getTime() + now.getTimezoneOffset() * 60000);
    const sessionId = getSessionId();
    let isNew: boolean | undefined;
    if (sessionId) {
        const w = await db.collection<TSessionBasic>('sessions').updateOne(
            {_id: sessionId},
            {
                $set: {
                    //_id: sessionId,
                    lastAccess: now
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
    const sessionId = getSessionId();
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
                    lastAccess: 1,
                    //customers: 0,
                    customerId: '$customerId',
                    customerEmail: { $ifNull: [ '$email', '$customerEmail' ] },
                    customerCompany: { $ifNull: [ '$company', '$customerCompany' ] },
                    customerFirstname: { $ifNull: [ '$firstName', '$customerFirstname' ] },
                    customerLastname: { $ifNull: [ '$lastName', '$customerLastname' ] },
                    customerAddress1: { $ifNull: [ '$address1', '$customerAddress1' ] },
                    customerAddress2: { $ifNull: [ '$address2', '$customerAddress2' ] },
                    customerCountry: { $ifNull: [ '$country', '$customerCountry' ] },
                    customerState: { $ifNull: [ '$state', '$customerState' ] },
                    customerPostcode: { $ifNull: [ '$postcode', '$customerPostcode' ] },
                    customerPhone: { $ifNull: [ '$phone', '$customerPhone' ] },
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

// export const getSessionClient = fn(async (db: Db) => {
//     const sessions = db.collection<TSession>('sessions');
//     const sessionId = getSessionId();
//     let session: TSessionClient | undefined;
//     if (sessionId) {
//         session = (await sessions.aggregate<TSessionClient>([
//             {
//                 $match: {
//                     _id: sessionId
//                 }
//             },
//             {
//                 $lookup: {
//                     from: "users",
//                     localField: "userId",
//                     foreignField: "_id",
//                     as: "users"
//                 }
//             },
//             {
//                 $replaceRoot: {
//                     newRoot: {
//                         $mergeObjects: [
//                             { $arrayElemAt: [ "$users", 0 ] },
//                             "$$ROOT"
//                         ]
//                     }
//                 }
//             },
//             {
//                 $project: {
//                     _id: 0,
//                     customerPresent: { $or: [
//                         {$ne: [{$type: "$customerId"}, 'missing']},
//                         {$ne: [{$type: "$customerEmail"}, 'missing']},
//                     ]},
//                     userPresent: {$ne: [{$type: "$userId"}, 'missing']},
//                     userAdmin: '$isAdmin',
//                 }
//             }
//         ])
//         .toArray())[0];
//     }
    
//     return session ?? {
//         customerPresent: false,
//         userPresent: false,
//         userAdmin: false,
//     };
// });

export const setCustomerSession = fn(async (db: Db, customerId: ObjectId) => {
    const sessionId = getSessionId();
    if (sessionId) {
        const w = await db.collection<TSessionCustomer>('sessions').updateOne(
            {_id: sessionId},
            {
                $set: {
                    customerId
                }
            }
        );
        return w.modifiedCount > 0;
    }
    return false;
});

export const clearCustomerSession = fn(async (db: Db) => {
    const sessionId = getSessionId();
    if (sessionId) {
        const w = await db.collection<TSessionCustomer>('sessions').updateOne(
            {_id: sessionId},
            {
                $unset: {
                    customerId: ""
                }
            }
        );
        return w.modifiedCount > 0;
    }
    return false;
});

export const setUserSession = fn(async (db: Db, userId: ObjectId) => {
    const sessionId = getSessionId();
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
    const sessionId = getSessionId();
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