/** 
 * https://github.com/atmulyana/nextCart
 **/
import type {SortDirection} from 'mongodb';
import config from '@/config';
import type {_Id, TProduct, TProductImage, TProductItem, TVariant} from './types';
import fn, {type Db, toId} from './db-conn';

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

export const getImage =  fn(async (db: Db, id: _Id, index: number): Promise<TProductImage | undefined> => {
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
    query: Object = {},
    numberOfItems: number = config.productsPerPage,
    includeTotalNumber: boolean = true
) => {
    let skip = 0;
    if(page > 1){
        skip = (page - 1) * numberOfItems;
    }

    const products = db.collection<TProductItem>('products');
    const data = await products.aggregate<TProductItem>([
        {
            $match: query
        },
        {
            $sort: getSort(),
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
    const totalItems = includeTotalNumber ? await products.countDocuments(query) : -1;

    return {
        data,
        totalItems
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

export const updateStock = fn(async (db: Db, id: { productId: _Id, variantId?: _Id}, newStock: number, oldStock?: number) => {
    const variants = db.collection('variants'),
          products = db.collection('products');
    if (oldStock === undefined) oldStock = await getStock(id.productId, id.variantId) ?? 0;
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

export const productExists = fn(async (db: Db, productId: _Id) => {
    const id = toId(productId);
    if (!id) return false;
    return await db.collection('products').countDocuments({_id: id}) > 0;
});

export const getActiveProductCount = fn(async (db: Db) => {
    return await db.collection('products').countDocuments({
        productPublished: true
    });
});