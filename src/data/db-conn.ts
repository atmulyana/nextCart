/** 
 * https://github.com/atmulyana/nextCart
 **/
import 'server-only';
import {cache} from 'react';
import {
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
    type InsertManyResult,
    type InsertOneOptions,
    type InsertOneResult,
    ObjectId,
    MongoClient,
    type OptionalUnlessRequiredId,
    type ReplaceOptions,
    type TransactionOptions,
    type UpdateFilter,
    type UpdateOptions,
    type UpdateResult,
    type WithoutId,
} from 'mongodb';
const {databaseConnectionString: dbUrl} = require('@/config').default;
import type {_Id} from './types';

type Db = MongoDb & {session?: ClientSession}
export {type Db, ObjectId};

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
        }
        return db;
    }
    return [getClient, getDb];
})();


//eslint-disable-next-line import/no-anonymous-default-export
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
              db = await getDb();
        const session = client.startSession();
        let redirect: Error | undefined;
        let result: T;
        try {
            db.session = session;
            result = await session.withTransaction<T>(
                async () => {
                    try {
                        result = await fn();
                    } catch (err) {
                        if ((err instanceof Error) && err.message == 'NEXT_REDIRECT') {
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
    dbTrans = async <T>(fn: () => Promise<T>, options?: TransactionOptions): Promise<T> => {
        console.log('====== WITHOUT TRANSACTION =======')
        return await fn();
    };
}
export {dbTrans};
