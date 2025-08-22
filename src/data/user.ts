/** 
 * https://github.com/atmulyana/nextCart
 **/
import type {TUser, WithoutId} from './types';
import fn, {type Db, toId} from './db-conn';
import type {_Id, Document} from './types';

export const getUsers = fn(async (db: Db) => {
    return await db.find('users', {}).project<Omit<TUser, 'userPassword'>>({userPassword: 0}).toArray();
});

export const getUserById = fn(async (db: Db, id: _Id) => {
    return await db.collection<TUser>('users').findOne({_id: toId(id)});
});

export const getUserByEmail = fn(async (db: Db, email: string, notId?: _Id) => {
    const filter: Document = {userEmail: email};
    if (notId) filter._id = {$ne: toId(notId)};
    return await db.collection<TUser>('users').findOne(filter);
});

export const userCount = fn(async (db: Db) => {
    return await db.collection('users').countDocuments();
});

export const createUser = fn(async (db: Db, user: WithoutId<TUser>) => {
    return (await db.collection('users').insertOne(user)).insertedId;
});

export const updateUser = fn(async (db: Db, id: _Id, user: WithoutId<TUser>) => {
    return (await db.collection('users').updateOne(
        {_id: toId(id)},
        {$set: user}
    )).modifiedCount > 0;
});

export const deleteUser = fn(async (db: Db, id: _Id) => {
    const userId = toId(id);
    db.collection('sessions').deleteMany({
        $and: [
            {userId},
            {customerId: {$exists: false}},
            {customerEmail: {$exists: false}},
        ]
    });
    db.collection('sessions').updateMany(
        {
            $and: [
                {userId},
                {
                    $or: [
                        {customerId: {$exists: false}},
                        {customerEmail: {$exists: false}},
                    ]
                },
            ]
        },
        {
            $unset: {
                userId: 1,
                user: 1,
                usersName: 1,
                isAdmin: 1,
                isOwner: 1,
            }
        }
    );
    return (await db.collection('users').deleteOne({_id: userId})).deletedCount > 0;
});