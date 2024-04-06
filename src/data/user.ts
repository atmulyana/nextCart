/** 
 * https://github.com/atmulyana/nextCart
 **/
import type {TUser} from './types';
import fn, {type Db} from './db-conn';

export const getUserByEmail = fn(async (db: Db, email: string) => {
    return await db.collection<TUser>('users').findOne({userEmail: email});
});

export const userCount = fn(async (db: Db) => {
    return await db.collection('users').countDocuments();
});

