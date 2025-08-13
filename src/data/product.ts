/** 
 * https://github.com/atmulyana/nextCart
 **/
import {Binary, type Document, type SortDirection} from 'mongodb';
import config from '@/config';
import type {
    _Id,
    ObjectId,
    TCartItem,
    TOrder,
    TProduct,
    TProductImage,
    TProductInsert,
    TProductItem,
    TVariant,
    WithoutId
} from './types';
import fn, {type Db, type Filter, toId} from './db-conn';

const variantPipeline = [
    {
        $set: {
            _id: {$toString: '$_id'},
        },
    },
    {
        $project: {
            product: 0,
        },
    }
];

export const getProduct = fn(async (db: Db, id: _Id): Promise<TProduct | undefined> => {
    return (await db.collection('products').aggregate<TProduct>([
        {
            $match: typeof(id) == 'string' ? {
                $or: [
                    {productPermalink: id},
                    {_id: toId(id)},
                ]
            } : {
                _id: id
            }
        },
        {
            $lookup: {
                from: 'variants',
                localField: '_id',
                foreignField: 'product',
                pipeline: variantPipeline,
                as: 'variants'
            }
        },
        {
            $set: {
                imageCount:  {
                    $cond: {
                        if: { $isArray: "$images" },
                        then: {$size: "$images"},
                        else: 0
                    }
                },
                imgaeDefaultIndex: {
                    $cond: {
                        if: { $isArray: "$images" },
                        then: {$indexOfArray: ["$images.default", true]},
                        else: -1
                    }
                },
            }
        },
        {
            $set: {

            }
        },
        {
            $project: {
                images: 0,
            }
        }
    ]).toArray())[0];
});

export const getVariant = fn(async (db: Db, id: {productId: _Id, variantId: _Id}): Promise<TVariant | null> => {
    return await db.collection<TVariant>('variants').findOne({
        _id: toId(id.variantId),
        product: toId(id.productId)
    });
});

export const getDefaultImage = fn(async (db: Db, id: _Id): Promise<TProductImage | undefined | null> => {
    const products = await db.collection('products').aggregate<{image: TProductImage | null}>([
        {
            $match: {
                _id: toId(id),
                productPublished: true,
            }
        },
        {
            $project: {
                _id: 0,
                image: {
                    $ifNull: [
                        {
                            $arrayElemAt: [
                                {
                                    $filter: {
                                        input: "$images",
                                        as: "image",
                                        cond: { $eq: [ "$$image.default", true ] }
                                    }
                                },
                                0
                            ]  
                        },
                        { $arrayElemAt: [ '$images', 0 ] }
                    ]
                }
            }
        }
    ]).toArray();
    return products.length > 0 ? products[0].image : void 0;
});

export const getImage = fn(async (db: Db, id: _Id, index: number): Promise<TProductImage | undefined> => {
    const prodImage = await db.collection<{image: TProductImage}>('products').findOne(
        {
            _id: toId(id),
        },
        {
            projection: {
                _id: 0,
                image: { $arrayElemAt: [ '$images', index ] },
            }
        }
    );
    return prodImage?.image;
});

function getSort(): {[field: string]: SortDirection} {
    let sortOrder: SortDirection = -1;
    if (config.productOrder == 'ascending'){
        sortOrder = 1;
    }
    let sortField = 'productAddedDate';
    if (config.productOrderBy == 'title'){
        sortField = 'productTitle';
    }

    return {
        [sortField]: sortOrder
    };
}

export const getProducts = fn(async (
    db: Db,
    page: number = 1,
    query: {
        $sort?: {
            [f: string]: 1|-1,
        },
        [exp: string]: any,
    } = {},
    numberOfItems: number = config.productsPerPage,
    includeTotalNumber: boolean = true
) => {
    let skip = 0;
    if(page > 1){
        skip = (page - 1) * numberOfItems;
    }
    let {$sort = getSort(), ...$match} = query;
    if (!('_id' in $sort)) {
        $sort._id = 1; //makes sure to use the same order in every page (no repetitive item in different page)
    }

    const products = db.collection<TProductItem>('products');
    const data = await products.aggregate<TProductItem>([
        {
            $match
        },
        {
            $sort,
        },
        {
            $skip: skip
        },
        {
            $limit: numberOfItems,
        },
        {
            $lookup: {
                from: 'variants',
                localField: '_id',
                foreignField: 'product',
                pipeline: variantPipeline,
                as: 'variants'
            }
        },
        {
            $project: {
                productPermalink: 1,
                productTitle: 1,
                productPrice: 1,
                productPublished: 1,
                productImage: {
                    $concat: [
                        '/product/',
                        {$toString: "$_id"},
                        '/image'
                    ]
                },
                variants: 1,
            },
        }
    ]).toArray();
    const totalItems = includeTotalNumber ? await products.countDocuments($match) : -1;

    return {
        data,
        itemsPerPage: numberOfItems,
        totalItems,
    };
});

export const getProductsByValue = fn(async (db: Db, value: number, limit: number = 0) => {
    let rs = db.collection('products').aggregate<
        Omit<TProduct, 'imageCount' | 'imgaeDefaultIndex' | 'tags'> & {variant?: TVariant}
    >([
        {
            $lookup: {
                from: 'variants',
                localField: '_id',
                foreignField: 'product',
                pipeline: variantPipeline,
                as: 'variant'
            }
        },
        {
            $unwind: {
                path: "$variant",
                preserveNullAndEmptyArrays: true,
            } 
        },
        {
            $match: {
                $or: [
                    {$and: [
                        {variant: {$exists: false}},
                        {productPrice: value},
                    ]},
                    {$and: [
                        {variant: {$exists: true}},
                        {'variant.price': value},
                    ]},
                ]
            }
        },
        {
            $project: {
                images: 0,
                tags: 0,
            },
        }
    ]);
    if (limit > 0) rs = rs.limit(limit);
    return await rs.toArray();
});

export const getVariants = fn(async (db: Db, productId: _Id) => {
    const arr = await db.collection<TVariant>('variants').aggregate([
        {
            $match: {
                product: toId(productId),
            }
        },
        ...variantPipeline,
    ]).toArray();
    return arr;
});

export const getStock = fn(async (db: Db, productId: _Id, variantId?: _Id) => {
    type Doc = {stock: number};
    if (variantId) {
        const doc = await db.collection('variants').findOne<Doc>(
            {
                _id: toId(variantId),
                product: toId(productId),
            },
            {
                projection: {
                    _id: 0,
                    stock: 1,
                }
            }
        );
        if (doc) return doc.stock;
    }
    else {
        const doc = await db.collection('products').findOne<Doc>(
            {
                _id: toId(productId),
            },
            {
                projection: {
                    _id: 0,
                    stock: '$productStock',
                }
            }
        );
        if (doc) return doc.stock;
    }
    return null;
});

export const addProduct = fn(async (db: Db, product: WithoutId<TProductInsert>) => {
    (product as TProduct).productAddedDate = new Date();
    const res = await db.collection('products').insertOne(product)
    return res.insertedId;
});

export const updateProduct = fn(async (db: Db, product: TProductInsert) => {
    product._id = toId(product._id) as ObjectId;
    const pipeline: any[] = [
        {
            $set: product
        }
    ];
    const $unset: string[] = [];
    if (!('tags' in product)) $unset.push('tags');
    if (!('productStock' in product)) $unset.push('productStock');
    if (!('productStockDisable' in product)) $unset.push('productStockDisable');
    if (!('productSubscription' in product)) $unset.push('productSubscription');
    if ($unset.length > 0) pipeline.push({$unset});

    const res = await db.collection('products').updateOne(
        {_id: product._id},
        pipeline
    );
    return res.modifiedCount > 0;
});

const getImagesProps = fn(async (db: Db, _id: ObjectId | undefined) => {
    if (!_id) return null;
    return await db.collection('products').findOne<{
        count: number,
        defaultIndex: number,
    }>(
        {
            _id,
        },
        {
            projection: {
                count: {
                    $cond: {
                        if: { $isArray: "$images" },
                        then: { $size: "$images" },
                        else: 0,
                    }
                },
                defaultIndex: {
                    $cond: {
                        if: { $isArray: "$images" },
                        then: {$indexOfArray: ["$images.default", true]},
                        else: -1
                    }
                },
            }
        }
    );
});

export const addImage = fn(async (db: Db, productId: _Id, image: File) => {
    const products = db.collection<TProductInsert & {images: TProductImage[]}>('products');
    const _id = toId(productId);
    const images = await getImagesProps(_id);
    if (!images) return false;

    const content = new Binary(await image.bytes());
    if (images.count > 0) {
        await products.updateOne(
            { _id },
            {
                $push: {
                    images: {
                        content,
                        type: image.type.substring('image/'.length),
                        default: false,
                    }
                }
            }
        );
    }
    else {
        await products.updateOne(
            { _id },
            {
                $set: {
                    images: [
                        {
                            content,
                            type: image.type.substring('image/'.length),
                            default: true,
                        }
                    ]
                }
            }
        );
    }

    return true;
});

export const deleteImage = fn(async (db: Db, productId: _Id, idx: number) => {
    const _id = toId(productId);
    const images = await getImagesProps(_id);
    if (!images || idx < 0 || idx >= images.count) return false;

    const products = db.collection('products');
    if (images.count < 2) {
        await products.updateOne(
            {_id},
            {$unset: {images: null}}
        );
    }
    else {
        await products.updateOne(
            {_id},
            [{
                $set: {
                    images: {
                        $concatArrays: [ 
                            {
                                $slice: ["$images", idx]
                            }, 
                            {
                                $slice: ["$images", idx+1, images.count]
                            }
                        ]
                    }
                }
            }]
        );
        if (idx == images.defaultIndex) {
            await products.updateOne(
                {_id},
                {
                    $set: {
                        'images.0.default': true,
                    }
                }
            );
        }
    }
    return true;
});

export const setMainImage = fn(async (db: Db, productId: _Id, idx: number) => {
    const _id = toId(productId);
    const images = await getImagesProps(_id);
    if (!images || idx < 0 || idx >= images.count) return false;
    if (idx == images.defaultIndex) return true;
    
    await db.collection('products').updateOne(
        {_id},
        {
            $set: {
                ['images.' + images.defaultIndex + '.default']: false,
                ['images.' + idx + '.default']: true,
            }
        }
    );
    return true;
});

export const addVariant = fn(async (db: Db, variant: WithoutId<TVariant>) => {
    //@ts-ignore
    delete variant._id;
    variant.product = toId(variant.product);
    const ret = await db.collection('variants').insertOne(variant)
    return ret.insertedId;
});

export const updateVariant = fn(async (db: Db, variant: TVariant) => {
    variant._id = toId(variant._id) as ObjectId;
    variant.product = toId(variant.product);
    const pipeline: any[] = [
        {$set: variant},
    ];
    
    const $unset: string[] = [];
    if (!('stock' in variant)) {
        $unset.push('stock');
    };
    if (!('imageIdx' in variant)) {
        $unset.push('imageIdx');
    };
    if ($unset.length > 0) pipeline.push({$unset});

    const ret = await db.collection('variants').updateOne(
        {_id: variant._id},
        pipeline,
        {upsert: false}
    );
    return ret.modifiedCount > 0;
});

export const deleteVariant = fn(async (db: Db, variantId: _Id) => {
    const ret = await db.collection('variants').deleteOne(
        {_id: toId(variantId)}
    );
    return ret.deletedCount > 0;
});

export const updateStock = fn(async (db: Db, id: { productId: _Id, variantId?: _Id}, newStock: number, oldStock?: number) => {
    const variants = db.collection('variants'),
          products = db.collection('products');
    if (oldStock === undefined) oldStock = await getStock(id.productId, id.variantId) || 0;
    if (id.variantId) {
        await variants.updateOne(
            {
                _id: toId(id.variantId)
            }, 
            {
                $set: {
                    stock: newStock
                }
            }
        );

        await products.updateOne(
            {
                _id: toId(id.productId)
            },
            [
                {
                    $set: {
                        productStock: {$subtract: ['$productStock', oldStock - newStock]}
                    }
                }
            ]
        );

        /***
         * Unfotunately, these statements below can't be used because the stock count of the updated variant hasn't changed
         * before committing the DB transaction. Therefore, we use the above one.
        newStock = (await variants.aggregate([
            {
                $match: {product: toId(id.productId)}
            },
            {
                $group: {
                    _id: null, //"$product",
                    totalStock: {$sum: "$stock"},
                }
            }
        ]).toArray())[0]?.totalStock ?? 0;
        await products.updateOne(
            {
                _id: toId(id.productId)
            },
            {
                $set: {
                    productStock: newStock
                }
            }
        );
        ***/
    }
    else {
        await products.updateOne(
            {
                _id: toId(id.productId)
            },
            {
                $set: {
                    productStock: newStock
                }
            }
        );
    }
});

export const setProductPublished = fn(async (db: Db, productId: _Id, published: boolean) => {
    const id = toId(productId);
    if (!id) return false;
    const w = await db.collection('products').updateOne({_id: id}, {$set: {productPublished: published}});
    return w.modifiedCount > 0;
});

export const productExists = fn(async (db: Db, productId: _Id) => {
    const id = toId(productId);
    if (!id) return false;
    return await db.collection('products').countDocuments({_id: id}) > 0;
});

export const permalinkExists = fn(async (db: Db, permalink: string, excludedProductId?: _Id) => {
    const filter: Filter<Document> = {productPermalink: permalink};
    if (excludedProductId) filter._id = {$ne: toId(excludedProductId)};
    return await db.collection('products').countDocuments(filter) > 0;
});

export const getActiveProductCount = fn(async (db: Db) => {
    return await db.collection('products').countDocuments({
        productPublished: true
    });
});

export const deleteProduct = fn(async (db: Db, productId: _Id) => {
    const id = toId(productId);
    if (!id) return false;
    
    const orders = await db.collection<TOrder>('orders').aggregate([
        {
            $project: {
                products: {$objectToArray: "$orderProducts"}
            }
        },
        {
            $match: {
                'products.v.productId': id
            }
        },
        {
            $limit: 1
        }
    ]).toArray();
    if (orders.length > 0) {
        await setProductPublished(id, false);
        return 0;
    }

    const updatedCarts =  await db.find('cartItems', {productId: id})
        .group({_id: '$_id.cartId', deletedQty: {$sum: '$quantity'}})
        .toArray();
    const carts = db.collection<TCartItem>('cart');
    for (let cart of updatedCarts) {
        await carts.updateOne(
            {
                _id: cart._id,
            },
            [
                {
                    $set: {
                        totalCartItems: {$subtract: ['$totalCartItems', cart.deletedQty]}
                    }
                }
            ]
        );
    }
    await db.collection<TCartItem>('cartItems').deleteMany({productId: id});
    
    await db.collection('reviews').deleteMany({product: id});
    await db.collection<TVariant>('variants').deleteMany({product: id});
    return (await db.collection<TProduct>('products').deleteOne({_id: id})).deletedCount > 0;
});