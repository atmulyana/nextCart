/** 
 * https://github.com/atmulyana/nextCart
 **/
import {TSession} from '@/data/types';
import fn, {type Db} from '@/data/db-conn';
import {getSessionId} from '@/data/session';

type TSessionPaypal = {
    paypalPaymentId?: string,
}

export const getPaymentId = fn(async (db: Db) => {
    const sessions = db.collection<TSession>('sessions');
    const sessionId = await getSessionId();
    let session: TSessionPaypal | undefined;
    if (sessionId) {
        session = (await sessions.aggregate<TSessionPaypal>([
            {
                $match: {
                    _id: sessionId
                }
            },
            {
                $project: {
                    paypalPaymentId: 1
                }
            },
        ])
        .toArray())[0];
    }
    return session?.paypalPaymentId;
});

export const setPaymentId = fn(async (db: Db, paymentId: string) => {
    const sessionId = await getSessionId();
    if (sessionId) {
        const w = await db.collection<TSessionPaypal>('sessions').updateOne(
            {_id: sessionId},
            {
                $set: {paypalPaymentId: paymentId}
            }
        );
        return w.modifiedCount > 0;
    }
    return false;
});

export const clearPaymentId = fn(async (db: Db) => {
    const sessionId = await getSessionId();
    if (sessionId) {
        const w = await db.collection<TSessionPaypal>('sessions').updateOne(
            {_id: sessionId},
            {
                $unset: {
                    paypalPaymentId: "",
                }
            }
        );
        return w.modifiedCount > 0;
    }
    return false;
});