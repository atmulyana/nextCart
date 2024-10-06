/** 
 * https://github.com/atmulyana/nextCart
 **/
import type {_Id} from '@/data/types';
import fn, {type Db} from '@/data/db-conn';
import {getSessionId} from '@/data/session';

export interface TSessionBlockonomics {
    blockonomicsParams?: {
        expectedBtc: number,
        address: string,
        timestamp: number,
        pendingOrderId: _Id,
    };
}

export const getParams = fn(async (db: Db) => {
    const sessions = db.collection('sessions');
    const sessionId = await getSessionId();
    let session: TSessionBlockonomics | undefined;
    if (sessionId) {
        session = (await sessions.aggregate<TSessionBlockonomics>([
            {
                $match: {
                    _id: sessionId
                }
            },
            {
                $project: {
                    blockonomicsParams: 1
                }
            },
        ])
        .toArray())[0];
    }
    return session?.blockonomicsParams;
});

export const setParams = fn(async (db: Db, params: TSessionBlockonomics['blockonomicsParams']) => {
    const sessionId = await getSessionId();
    if (sessionId) {
        const w = await db.collection<TSessionBlockonomics>('sessions').updateOne(
            {_id: sessionId},
            {
                $set: {blockonomicsParams: params}
            }
        );
        return w.modifiedCount > 0;
    }
    return false;
});

export const clearParams = fn(async (db: Db) => {
    const sessionId = await getSessionId();
    if (sessionId) {
        const w = await db.collection<TSessionBlockonomics>('sessions').updateOne(
            {_id: sessionId},
            {
                $unset: {
                    blockonomicsParams: "",
                }
            }
        );
        return w.modifiedCount > 0;
    }
    return false;
});