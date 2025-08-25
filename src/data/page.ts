/** 
 * https://github.com/atmulyana/nextCart
 **/
import config from '@/config';
import fn, {type Db, toId} from './db-conn';
import type {_Id, Document, TPage, WithoutId} from './types';

export const getPage = fn(async (db: Db, slug: string) => {
    return await db.collection<TPage>('pages').findOne({slug, enabled: true});
});

export const getPageById = fn(async (db: Db, id: _Id) => {
    return await db.collection<TPage>('pages').findOne({_id: toId(id)});
});

export const pageSlugAvailable = fn(async (db: Db, slug: string, notId: _Id) => {
    const filter: Document = {slug};
    if (notId) filter._id = {$ne: toId(notId)};
    return await db.collection('pages').findOne(filter) == null;
});

export const getPages = fn(async (
    db: Db,
    page: number = 1,
    numberOfItems: number = config.itemsPerPage,
    includeTotalNumber: boolean = true
) => {
    let skip = 0;
    if(page > 1){
        skip = (page - 1) * numberOfItems;
    }
    const pages = db.collection<TPage>('pages');
    const data = await pages.aggregate<TPage>([
        {
            $sort: {name: 1},
        },
        {
            $skip: skip
        },
        {
            $limit: numberOfItems,
        },
    ]).toArray();
    const totalItems = includeTotalNumber ? await pages.countDocuments() : -1;

    return {
        data,
        itemsPerPage: numberOfItems,
        totalItems,
    };
});

export const addPage = fn(async (db: Db, page: WithoutId<TPage>) => {
    return (await db.collection<typeof page>('pages').insertOne(page)).insertedId;
});

export const updatePage = fn(async (db: Db, id: _Id, page: WithoutId<TPage>) => {
    return (await db.collection<typeof page>('pages').updateOne(
        {_id: toId(id)},
        {$set: page}
    )).modifiedCount > 0;
});

export const deletePage = fn(async (db: Db, id: _Id) => {
    return (await db.collection('pages').deleteOne({_id: toId(id)})).deletedCount > 0;
});