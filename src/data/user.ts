/** 
 * https://github.com/atmulyana/nextCart
 **/
import type {TUser} from './types';
import fn, {type Db, toId} from './db-conn';
import type {_Id} from './types';

export const getUsers = fn(async (db: Db) => {
    return await db.find('users', {}).project<Omit<TUser, 'userPassword'>>({userPassword: 0}).toArray();
});

export const getUserById = fn(async (db: Db, id: _Id) => {
    return await db.collection<TUser>('users').findOne({_id: toId(id)});
});

export const getUserByEmail = fn(async (db: Db, email: string) => {
    return await db.collection<TUser>('users').findOne({userEmail: email});
});

export const userCount = fn(async (db: Db) => {
    return await db.collection('users').countDocuments();
});

export const deleteUser = fn(async (db: Db, id: _Id) => {
    return (await db.collection('users').deleteOne({_id: toId(id)})).deletedCount > 0;
});