/** 
 * https://github.com/atmulyana/nextCart
 **/
import type {_Id, TCart, TCartItem, WithId} from '@/data/types';
import {updateSession} from '@/lib/auth';
import fn, {type Db, ObjectId, toId, dbTrans} from './db-conn';
import {getSessionId} from './session';

const cartAggrStages = [
    {
        $lookup: {
            as: "items",
            from: "cartItems",
            localField: "_id",
            foreignField: "_id.cartId",
            pipeline: [
                {
                    $lookup: {
                        as: "product",
                        from: "products",
                        localField: "productId",
                        foreignField: "_id",
                    }
                },
                {
                    $lookup: {
                        as: "variant",
                        from: "variants",
                        localField: "variantId",
                        foreignField: "_id",
                    }
                },
                {
                    $set: {
                        product: {
                            $arrayElemAt: ["$product", 0]
                        },
                        variant: {
                            $arrayElemAt: ["$variant", 0]
                        }
                    }
                },
                { 
                    $replaceWith: {
                        k: {
                            $toString: "$_id.itemId"
                        },
                        v: {
                            productId: {$toString: "$productId"},
                            title: "$product.productTitle",
                            link: {
                                $ifNull: [
                                    "$product.productPermalink",
                                    { $toString: "$product._id" }
                                ]
                            },
                            productImage: {
                                $concat: [
                                    '/product/',
                                    {$toString: "$productId"},
                                    '/image'
                                ]
                            },
                            quantity: "$quantity",
                            totalItemPrice: {
                                $ifNull: [
                                    {
                                        $multiply: ["$variant.price", "$quantity"]
                                    },
                                    {
                                        $multiply: ["$product.productPrice", "$quantity"]
                                    },
                                ]
                            },
                            productStock: "$product.productStock",
                            productStockDisable: "$product.productStockDisable",
                            productSubscription: "$product.productSubscription",
                            productComment: "$productComment",
                            variantId: {$toString: "$variantId"},
                            variantTitle: "$variant.title",
                            variantStock: "$variant.stock",
                        },
                    } 
                },
                {
                    $project: {
                        _id: 0,
                    }
                },
            ]
        }
    },
    {
        $project: {
            customerId: 1,
            orderComment: 1,
            items: {
                $arrayToObject: "$items"
            },
            discount: 1,
            shippingMessage: 1,
            totalCartNetAmount: 1,
            totalCartDiscount: 1,
            totalCartShipping: 1,
            totalCartAmount: 1,
            totalCartItems: 1,
        }
    }
];

export const getCart = fn(async (db: Db) => {
    const sessionId = await getSessionId();
    let cart: WithId<TCart> | undefined;
    if (sessionId) {
        const docs = await db.collection('cart').aggregate<WithId<TCart>>([
            {
                $match: {
                    _id: sessionId
                }
            },
            ...cartAggrStages
        ]).toArray();
        if (docs.length > 0) cart = docs[0];
    }
    return cart;
});

export const getCartById = fn(async (db: Db, id: _Id) => {
    const carts = await db.collection('cart').aggregate<WithId<TCart>>([
        {
            $match: {
                _id: toId(id)
            }
        },
        ...cartAggrStages
    ]).toArray();
    if (carts.length > 0) return carts[0];
});

export const getCartHeader = fn(async (db: Db) => {
    const sessionId = await getSessionId();
    let cart: Omit<TCart, 'items'> | undefined;
    if (sessionId) {
        const docs = await db.collection('sessions').aggregate<NonNullable<typeof cart>>([
            {
                $match: {
                    _id: sessionId
                }
            },
            {
                $project: {
                    cartId: { $ifNull: [ '$customerId', '$_id' ] }
                }
            },
            {
                $lookup: {
                    as: "cart",
                    from: "cart",
                    localField: "cartId",
                    foreignField: "_id",
                }
            },
            {
                $unwind: "$cart"
            },
            {
                $replaceRoot: { newRoot: "$cart" }
            },
            {
                $project: {
                    _id: 0,
                    items: 0,
                }
            }
        ]).toArray();
        if (docs.length > 0) cart = docs[0];
    }
    return cart;
});

export const upsertCart = fn(async (db: Db, cartId: ObjectId, cart: Omit<TCart, 'items'>) => {
    if ('_id' in cart) delete cart._id;
    const $set: Partial<TCart> = {...cart};
    delete $set.items;
    if (!cart.discount) delete $set.discount;
    if (!cart.orderComment) delete $set.orderComment;
    if (!cart.shippingMessage) delete $set.shippingMessage;
    
    await db.collection('cart').updateOne(
        {
            _id: cartId
        },
        {$set},
        {
            upsert: true,
        }
    );
});

export const deleteCart = fn(async (db: Db, cartId: ObjectId) => {
    await db.collection('cart').deleteOne(
        {
            _id: cartId
        }
    );
    await db.collection('cartItems').deleteMany(
        {
            '_id.cartId': cartId
        }
    );
});

export const upsertCartItem = fn(async (
    db: Db,
    cartId: ObjectId,
    itemId: _Id,
    cartItem: Pick<TCartItem, 'productId' | 'quantity' | 'productComment' | 'variantId'>
) => {
    const $set: typeof cartItem = {
        productId: toId(cartItem.productId) as ObjectId,
        quantity: cartItem.quantity,
        productComment: cartItem.productComment,
        variantId: cartItem.variantId && toId(cartItem.variantId),
    };
    if (!cartItem.productComment) delete $set.productComment;
    if (!cartItem.variantId) delete $set.variantId;
    await db.collection('cartItems').updateOne(
        {
            _id: {
                cartId,
                itemId: toId(itemId),
            }
        },
        {$set},
        {
            upsert: true,
        }
    );
});

export const addCartItems = fn(async (
    db: Db,
    cartId: ObjectId,
    cartItems: Array<Pick<TCartItem, 'productId' | 'quantity' | 'productComment' | 'variantId'> & {id: _Id}>
) => {
    type _TCartItem = Partial<TCartItem> & {
        _id: {
            cartId: ObjectId,
            itemId: ObjectId,
        }
    };
    const items: _TCartItem[] = [];
    for (let item of cartItems) {
        const cartItem: _TCartItem = {
            _id: {
                cartId,
                itemId: (toId(item.id) as ObjectId),
            },
            productId: toId(item.productId),
            quantity: item.quantity,
        };
        if (!cartItem._id.itemId) continue;
        if (item.variantId) cartItem.variantId = item.variantId;
        if (item.productComment) cartItem.productComment = item.productComment;
        items.push(cartItem);
    }
    
    await db.collection<_TCartItem>('cartItems').insertMany(items);
});

export const deleteCartItem = fn(async (db: Db, cartId: ObjectId, itemId: _Id) => {
    await db.collection('cartItems').deleteOne(
        {
            _id: {
                cartId,
                itemId: toId(itemId),
            }
        }
    );
});

export const deleteCartItems = fn(async (db: Db, cartId: ObjectId, itemIds: _Id[]) => {
    const w = await db.collection('cartItems').deleteMany(
        {
            '_id.cartId': cartId,
            '_id.itemId': { $in: itemIds.map(id => toId(id)) },
        }
    );
});

export async function cartTrans(fn: () => Promise<Response | undefined>) {
    return await dbTrans(async () => {
        const response = await fn();
        if (response) {
            const data = await response.json();
            const chartItemCount = data.totalCartItems as number;
            await updateSession({
                customer: {
                    chartItemCount,
                }
            });
            return response;
        }
    });
}