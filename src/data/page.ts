/** 
 * https://github.com/atmulyana/nextCart
 **/
import type {TPage} from './types';
import fn, {type Db} from './db-conn';

export const getPage = fn(async (db: Db, slug: string) => {
    return await db.collection<TPage>('pages').findOne({slug, enabled: true});
});