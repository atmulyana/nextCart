/** 
 * https://github.com/atmulyana/nextCart
 **/
import 'server-only';
import {cache} from 'react';
import {
    type AggregationCursor,
    type BulkWriteOptions,
    type ClientSession,
    type Collection,
    type CollectionOptions,
    type CommandOperationOptions,
    type Db as MongoDb,
    type DeleteOptions,
    type DeleteResult,
    type Document,
    type Filter,
    type FindCursor,
    type FindOneAndUpdateOptions,
    type InsertManyResult,
    type InsertOneOptions,
    type InsertOneResult,
    ObjectId,
    MongoClient,
    type OptionalUnlessRequiredId,
    type ReplaceOptions,
    type Sort,
    type TransactionOptions,
    type UpdateFilter,
    type UpdateOptions,
    type UpdateResult,
    type WithoutId,
} from 'mongodb';
import appCfg from '@/config';
const {databaseConnectionString: dbUrl} = appCfg;
import {isRedirectError} from '@/lib/common';
import type {_Id} from './types';

type Db = MongoDb & {
    find: <T extends Document = Document>(collectionName: string, $match: Document) => AggregationCursor<T>,
    session?: ClientSession,
}
export {type Db, type Filter, ObjectId};

// function cache<F extends Function>(fn: F): F {
//     return fn;
// }

export function toId<ID extends _Id>(id: ID | undefined): (ID extends ObjectId ? ObjectId : (ObjectId | undefined)) {
    if (id instanceof ObjectId) return id;
    return (id && ObjectId.isValid(id) ? ObjectId.createFromHexString(id) : void 0) as any; //It's weird that we must use `any` here (ts bug)
}

const [getClient, getDb] = (function() {
    let client!: MongoClient;
    async function getClient() {
        if (!client) {
            client = await MongoClient.connect(dbUrl);
        }
        return client;
    }

    let db!: Db;
    async function getDb() {
        if (!db) {
            const client = await getClient();
            const _db = client.db() as Db;
            
            const applySession = <T extends CommandOperationOptions>(options?: T): T | undefined => {
                if (_db.session) {
                    if (options) {
                        options.session = _db.session;
                        return options;
                    }
                    else {
                        return {
                            session: _db.session,
                        } as T;
                    }
                }
                else {
                    return options;
                }
            }
            
            db = new Proxy(_db, {
                get(target, prop, receiver) {
                    if (prop == 'collection') {
                        return function<TSchema extends Document = Document>(name: string, opts?: CollectionOptions): Collection<TSchema> {
                            const col = _db.collection<TSchema>(name, opts);
                            return new Proxy(col, {
                                get(target, prop, receiver) {
                                    if (prop == 'insertOne') {
                                        return function(
                                            doc: OptionalUnlessRequiredId<TSchema>,
                                            options?: InsertOneOptions
                                        ): Promise<InsertOneResult<TSchema>> {
                                            return col.insertOne(doc, applySession(options));
                                        }
                                    }
                                    else if (prop == 'insertMany') {
                                        return function(
                                            docs: OptionalUnlessRequiredId<TSchema>[],
                                            options?: BulkWriteOptions
                                        ): Promise<InsertManyResult<TSchema>> {
                                            return col.insertMany(docs, applySession(options));
                                        }
                                    }
                                    else if (prop == 'findOneAndUpdate') {
                                        return function(
                                            filter: Filter<TSchema>,
                                            update: UpdateFilter<TSchema> | Document[],
                                            options: FindOneAndUpdateOptions & {includeResultMetadata?: boolean}
                                        ) {
                                            return col.findOneAndUpdate(filter, update, options);
                                        }
                                    }
                                    else if (prop == 'updateOne') {
                                        return function(
                                            filter: Filter<TSchema>,
                                            update: UpdateFilter<TSchema> | Partial<TSchema>, 
                                            options?: UpdateOptions
                                        ): Promise<UpdateResult<TSchema>> {
                                            return col.updateOne(filter, update, applySession(options));
                                        }
                                    }
                                    else if (prop == 'replaceOne') {
                                        return function(
                                            filter: Filter<TSchema>,
                                            replacement: WithoutId<TSchema>,
                                            options?: ReplaceOptions
                                        ): Promise<UpdateResult<TSchema> | Document> {
                                            return col.replaceOne(filter, replacement, applySession(options));
                                        }
                                    }
                                    else if (prop == 'updateMany') {
                                        return function(
                                            filter: Filter<TSchema>,
                                            update: UpdateFilter<TSchema>,
                                            options?: UpdateOptions
                                        ): Promise<UpdateResult<TSchema>> {
                                            return col.updateMany(filter, update, applySession(options));
                                        }
                                    }
                                    else if (prop == 'deleteOne') {
                                        return function(
                                            filter?: Filter<TSchema>,
                                            options?: DeleteOptions
                                        ): Promise<DeleteResult> {
                                            return col.deleteOne(filter, applySession(options));
                                        }
                                    }
                                    else if (prop == 'deleteMany') {
                                        return function(
                                            filter?: Filter<TSchema>,
                                            options?: DeleteOptions
                                        ): Promise<DeleteResult> {
                                            return col.deleteMany(filter, applySession(options));
                                        }
                                    }
                                    return Reflect.get(target, prop, receiver);
                                },
                            });
                        }
                    }
                    return Reflect.get(target, prop, receiver);
                },
            });

            db.find = <T extends Document = Document>(collectionName: string, $match: Document) => {
                return db.collection(collectionName).aggregate<T>().match($match);
            };
        }
        return db;
    }
    return [getClient, getDb];
})();


export default <Func extends ((_db: Db, ...args: any[]) => Promise<any>)>(
    fn: Func
) => cache(async function(...args: any[]) {
    return await fn(await getDb(), ...args);
}) as (
    //No argument
    Parameters<Func>[1] extends undefined ? (
        () => ReturnType<Func> 
    ) :
    //One argument (may be optional)
    Parameters<Func>[2] extends undefined ? (
        undefined extends Parameters<Func>[1] ? (arg1?: Parameters<Func>[1]) => ReturnType<Func>
                                              : (arg1: Parameters<Func>[1]) => ReturnType<Func>
    ) :
    //Two arguments (1 or 2 last arguments may be optional)
    Parameters<Func>[3] extends undefined ? (
        undefined extends Parameters<Func>[2] ? (
            undefined extends Parameters<Func>[1] ? 
                (arg1?: Parameters<Func>[1], arg2?: Parameters<Func>[2]) => ReturnType<Func> :
                (arg1: Parameters<Func>[1], arg2?: Parameters<Func>[2]) => ReturnType<Func>
        ) :
        (arg1: Parameters<Func>[1], arg2: Parameters<Func>[2]) => ReturnType<Func>
    ) :
    //Three arguments (1 to 3 last arguments may be optional)
    Parameters<Func>[4] extends undefined ? (
        undefined extends Parameters<Func>[3] ? (
            undefined extends Parameters<Func>[2] ? (
                undefined extends Parameters<Func>[1] ?
                    (arg1?: Parameters<Func>[1], arg2?: Parameters<Func>[2], arg3?: Parameters<Func>[3]) => ReturnType<Func> :
                    (arg1: Parameters<Func>[1], arg2?: Parameters<Func>[2], arg3?: Parameters<Func>[3]) => ReturnType<Func>
            ) :
            (arg1: Parameters<Func>[1], arg2: Parameters<Func>[2], arg3?: Parameters<Func>[3]) => ReturnType<Func>
        ) :
        (arg1: Parameters<Func>[1], arg2: Parameters<Func>[2], arg3: Parameters<Func>[3]) => ReturnType<Func>
    ) :
    //Four arguments (1 to 4 last arguments may be optional)
    Parameters<Func>[5] extends undefined ? (
        undefined extends Parameters<Func>[4] ? (
            undefined extends Parameters<Func>[3] ? (
                undefined extends Parameters<Func>[2] ? (
                    undefined extends Parameters<Func>[1] ?
                        (
                            arg1?: Parameters<Func>[1],
                            arg2?: Parameters<Func>[2],
                            arg3?: Parameters<Func>[3],
                            arg4?: Parameters<Func>[4]
                        ) => ReturnType<Func> :
                        (
                            arg1: Parameters<Func>[1],
                            arg2?: Parameters<Func>[2],
                            arg3?: Parameters<Func>[3],
                            arg4?: Parameters<Func>[4]
                        ) => ReturnType<Func>
                ) :
                (
                    arg1: Parameters<Func>[1],
                    arg2: Parameters<Func>[2],
                    arg3?: Parameters<Func>[3],
                    arg4?: Parameters<Func>[4]
                ) => ReturnType<Func>

            ) :
            (
                arg1: Parameters<Func>[1],
                arg2: Parameters<Func>[2],
                arg3: Parameters<Func>[3],
                arg4?: Parameters<Func>[4]
            ) => ReturnType<Func>
        ) :
        (
            arg1: Parameters<Func>[1],
            arg2: Parameters<Func>[2],
            arg3: Parameters<Func>[3],
            arg4: Parameters<Func>[4]
        ) => ReturnType<Func>
    ) :
    //Five arguments (1 to 5 last arguments may be optional)
    Parameters<Func>[6] extends undefined ? (
        undefined extends Parameters<Func>[5] ? (
            undefined extends Parameters<Func>[4] ? (
                undefined extends Parameters<Func>[3] ? (
                    undefined extends Parameters<Func>[2] ? (
                        undefined extends Parameters<Func>[1] ?
                            (
                                arg1?: Parameters<Func>[1],
                                arg2?: Parameters<Func>[2],
                                arg3?: Parameters<Func>[3],
                                arg4?: Parameters<Func>[4],
                                arg5?: Parameters<Func>[5]
                            ) => ReturnType<Func> :
                            (
                                arg1: Parameters<Func>[1],
                                arg2?: Parameters<Func>[2],
                                arg3?: Parameters<Func>[3],
                                arg4?: Parameters<Func>[4],
                                arg5?: Parameters<Func>[5]
                            ) => ReturnType<Func>
                    ) :
                    (
                        arg1: Parameters<Func>[1],
                        arg2: Parameters<Func>[2],
                        arg3?: Parameters<Func>[3],
                        arg4?: Parameters<Func>[4],
                        arg5?: Parameters<Func>[5]
                    ) => ReturnType<Func>
                ) :
                (
                    arg1: Parameters<Func>[1],
                    arg2: Parameters<Func>[2],
                    arg3: Parameters<Func>[3],
                    arg4?: Parameters<Func>[4],
                    arg5?: Parameters<Func>[5]
                ) => ReturnType<Func>
            ) :
            (
                arg1: Parameters<Func>[1],
                arg2: Parameters<Func>[2],
                arg3: Parameters<Func>[3],
                arg4: Parameters<Func>[4],
                arg5?: Parameters<Func>[5]
            ) => ReturnType<Func>
        ) :
        (
            arg1: Parameters<Func>[1],
            arg2: Parameters<Func>[2],
            arg3: Parameters<Func>[3],
            arg4: Parameters<Func>[4],
            arg5: Parameters<Func>[5]
        ) => ReturnType<Func>
    ) :
    //Six arguments (1 to 6 last arguments may be optional)
    Parameters<Func>[7] extends undefined ? (
        undefined extends Parameters<Func>[6] ? (
            undefined extends Parameters<Func>[5] ? (
                undefined extends Parameters<Func>[4] ? (
                    undefined extends Parameters<Func>[3] ? (
                        undefined extends Parameters<Func>[2] ? (
                            undefined extends Parameters<Func>[1] ?
                                (
                                    arg1?: Parameters<Func>[1],
                                    arg2?: Parameters<Func>[2],
                                    arg3?: Parameters<Func>[3],
                                    arg4?: Parameters<Func>[4],
                                    arg5?: Parameters<Func>[5],
                                    arg6?: Parameters<Func>[6],
                                ) => ReturnType<Func> :
                                (
                                    arg1: Parameters<Func>[1],
                                    arg2?: Parameters<Func>[2],
                                    arg3?: Parameters<Func>[3],
                                    arg4?: Parameters<Func>[4],
                                    arg5?: Parameters<Func>[5],
                                    arg6?: Parameters<Func>[6],
                                ) => ReturnType<Func>
                        ) :
                        (
                            arg1: Parameters<Func>[1],
                            arg2: Parameters<Func>[2],
                            arg3?: Parameters<Func>[3],
                            arg4?: Parameters<Func>[4],
                            arg5?: Parameters<Func>[5],
                            arg6?: Parameters<Func>[6],
                        ) => ReturnType<Func>
                    ) :
                    (
                        arg1: Parameters<Func>[1],
                        arg2: Parameters<Func>[2],
                        arg3: Parameters<Func>[3],
                        arg4?: Parameters<Func>[4],
                        arg5?: Parameters<Func>[5],
                        arg6?: Parameters<Func>[6],
                    ) => ReturnType<Func>
                ) :
                (
                    arg1: Parameters<Func>[1],
                    arg2: Parameters<Func>[2],
                    arg3: Parameters<Func>[3],
                    arg4: Parameters<Func>[4],
                    arg5?: Parameters<Func>[5],
                    arg6?: Parameters<Func>[6],
                ) => ReturnType<Func>
            ) :
            (
                arg1: Parameters<Func>[1],
                arg2: Parameters<Func>[2],
                arg3: Parameters<Func>[3],
                arg4: Parameters<Func>[4],
                arg5: Parameters<Func>[5],
                arg6?: Parameters<Func>[6],
            ) => ReturnType<Func>
        ) :
        (
            arg1: Parameters<Func>[1],
            arg2: Parameters<Func>[2],
            arg3: Parameters<Func>[3],
            arg4: Parameters<Func>[4],
            arg5: Parameters<Func>[5],
            arg6: Parameters<Func>[6],
        ) => ReturnType<Func>
    ) :
    //Seven arguments (1 to 7 last arguments may be optional)
    (
        undefined extends Parameters<Func>[7] ? (
            undefined extends Parameters<Func>[6] ? (
                undefined extends Parameters<Func>[5] ? (
                    undefined extends Parameters<Func>[4] ? (
                        undefined extends Parameters<Func>[3] ? (
                            undefined extends Parameters<Func>[2] ? (
                                undefined extends Parameters<Func>[1] ?
                                    (
                                        arg1?: Parameters<Func>[1],
                                        arg2?: Parameters<Func>[2],
                                        arg3?: Parameters<Func>[3],
                                        arg4?: Parameters<Func>[4],
                                        arg5?: Parameters<Func>[5],
                                        arg6?: Parameters<Func>[6],
                                        arg7?: Parameters<Func>[7],
                                    ) => ReturnType<Func> :
                                    (
                                        arg1: Parameters<Func>[1],
                                        arg2?: Parameters<Func>[2],
                                        arg3?: Parameters<Func>[3],
                                        arg4?: Parameters<Func>[4],
                                        arg5?: Parameters<Func>[5],
                                        arg6?: Parameters<Func>[6],
                                        arg7?: Parameters<Func>[7],
                                    ) => ReturnType<Func>

                            ) :
                            (
                                arg1: Parameters<Func>[1],
                                arg2: Parameters<Func>[2],
                                arg3?: Parameters<Func>[3],
                                arg4?: Parameters<Func>[4],
                                arg5?: Parameters<Func>[5],
                                arg6?: Parameters<Func>[6],
                                arg7?: Parameters<Func>[7],
                            ) => ReturnType<Func>
                        ) :
                        (
                            arg1: Parameters<Func>[1],
                            arg2: Parameters<Func>[2],
                            arg3: Parameters<Func>[3],
                            arg4?: Parameters<Func>[4],
                            arg5?: Parameters<Func>[5],
                            arg6?: Parameters<Func>[6],
                            arg7?: Parameters<Func>[7],
                        ) => ReturnType<Func>
                    ) :
                    (
                        arg1: Parameters<Func>[1],
                        arg2: Parameters<Func>[2],
                        arg3: Parameters<Func>[3],
                        arg4: Parameters<Func>[4],
                        arg5?: Parameters<Func>[5],
                        arg6?: Parameters<Func>[6],
                        arg7?: Parameters<Func>[7],
                    ) => ReturnType<Func>
                ) :
                (
                    arg1: Parameters<Func>[1],
                    arg2: Parameters<Func>[2],
                    arg3: Parameters<Func>[3],
                    arg4: Parameters<Func>[4],
                    arg5: Parameters<Func>[5],
                    arg6?: Parameters<Func>[6],
                    arg7?: Parameters<Func>[7],
                ) => ReturnType<Func>
            ) :
            (
                arg1: Parameters<Func>[1],
                arg2: Parameters<Func>[2],
                arg3: Parameters<Func>[3],
                arg4: Parameters<Func>[4],
                arg5: Parameters<Func>[5],
                arg6: Parameters<Func>[6],
                arg7?: Parameters<Func>[7],
            ) => ReturnType<Func>
        ) :
        (
            arg1: Parameters<Func>[1],
            arg2: Parameters<Func>[2],
            arg3: Parameters<Func>[3],
            arg4: Parameters<Func>[4],
            arg5: Parameters<Func>[5],
            arg6: Parameters<Func>[6],
            arg7: Parameters<Func>[7],
        ) => ReturnType<Func>
    )
);

let dbTrans: <T>(fn: () => Promise<T>, options?: TransactionOptions) => Promise<T>;
if (/(\?|&)replicaSet=/i.test(dbUrl)) {
    dbTrans = async <T>(fn: () => Promise<T>, options?: TransactionOptions): Promise<T> => {
        console.log('====== WITH TRANSACTION =======')
        const client = await getClient(),
              db = await getDb(),
              isNestedTrans = !!db.session;
        
        if (isNestedTrans) return await fn();

        const session = client.startSession();
        let redirect: Error | undefined;
        let result: T;
        try {
            db.session = session;
            result = await session.withTransaction<T>(
                async () => {
                    try {
                        result = await fn();
                    } catch (err: any) {
                        if (isRedirectError(err)) {
                            redirect = err;
                        }
                        else {
                            throw err;
                        }
                    }
                    return result;
                },
                options
            );
        } finally {
            await session.endSession();
            delete db.session;
        }

        if (redirect) throw redirect;
        return result;
    };
}
else {
    dbTrans = async <T>(fn: () => Promise<T>): Promise<T> => {
        console.log('====== WITHOUT TRANSACTION =======')
        return await fn();
    };
}
export {dbTrans};

export async function paging<T = any>(rs: AggregationCursor<T>, limit: number = appCfg.itemsPerPage, page: number = 1, sort?: Sort) {
    let count = -1;
    let rs2 = rs.clone();
    if (sort) rs = rs.sort(sort);
    if (limit > 0) {
        if (page > 0) rs = rs.skip((page-1) * limit);
        rs = rs.limit(limit);
    }

    return {
        list: await rs.toArray(),
        count: async () => {
            if (count < 0) {
                /** `rs` and `r2` shares `pipeline` instance (unfortunately) */
                if ('$limit' in rs2.pipeline[rs2.pipeline.length - 1]) rs2.pipeline.length--;
                if ('$skip' in rs2.pipeline[rs2.pipeline.length - 1]) rs2.pipeline.length--;
                if ('$sort' in rs2.pipeline[rs2.pipeline.length - 1]) rs2.pipeline.length--;
                
                count = (await rs2.group<{count: number}>({_id: null, count: {$sum: 1}}).toArray())[0]?.count ?? 0;
            }
            return count;
        },
        page,
        itemsPerPage: limit,
        pageCount: async function() {
            if (limit < 1) return 1;
            return Math.ceil(await this.count() / limit);
        },
    };
}


export async function getPagedList<T>(
    query: AggregationCursor<T> | FindCursor<T>,
    page: number = 1,
    itemsPerPage: number = appCfg.itemsPerPage
) {
    let skip = 0;
    if (page > 1) {
        skip = (page - 1) * itemsPerPage;
    }

    const list = await query.skip(skip).limit(itemsPerPage + 1).toArray();
    const isNext = list.length > itemsPerPage;
    if (isNext) list.length = itemsPerPage;

    return {
        list,
        isNext,
        page,
        itemsPerPage,
    };
}
