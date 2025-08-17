/** 
 * https://github.com/atmulyana/nextCart
 **/
import type {_Id, Document, TCart, TCartItemBase, WithId} from '@/data/types';
import {redirectWithMessage, updateSessionToken} from '@/lib/auth';
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
                                    '/image/',
                                    {
                                        $ifNull: [
                                            {$toString: "$variant.imageIdx"}, 
                                            ""
                                        ]
                                    },
                                    "?invalid-idx=default"
                                ]
                            },
                            quantity: "$quantity",
                            totalItemPrice: {
                                $ifNull: [
                                    //"$totalItemPrice",
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
            totalCartProducts: 1,
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
        const docs = await db.collection('cart').aggregate<NonNullable<typeof cart>>([
            {
                $match: {
                    _id: sessionId
                }
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
    const $set: Partial<TCart> = {...cart},
          $unset: Document = {};
    if ('_id' in $set) delete $set._id;
    delete $set.items;
    if (!cart.discount) {
        delete $set.discount;
        $unset.discount = null;
    }
    if (!cart.orderComment) {
        delete $set.orderComment;
        $unset.orderComment = null;
    }
    if (!cart.shippingMessage) {
        delete $set.shippingMessage;
        $unset.shippingMessage = null;
    }
    
    await db.collection('cart').updateOne(
        {
            _id: cartId
        },
        {
            $set,
            $unset,
        },
        {
            upsert: true,
        }
    );
});

export const updateOrderComment = fn(async (db: Db, orderComment: string) => {
    await db.collection('cart').updateOne(
        {
            _id: (await getSessionId()) ?? undefined
        },
        {
            $set: {
                orderComment
            }
        },
    );
});

export const deleteCart = fn(async (db: Db, cartId?: ObjectId) => {
    if (!cartId) {
        const id = await getSessionId();
        if (!id) return;
        cartId = id;
    }
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
    cartItem: TCartItemBase
) => {
    const $set: typeof cartItem = {
        productId: toId(cartItem.productId) as ObjectId,
        productComment: cartItem.productComment,
        quantity: cartItem.quantity,
        //totalItemPrice: cartItem.totalItemPrice,
        variantId: cartItem.variantId && toId(cartItem.variantId),
    };
    const $unset: Document = {};
    if (!cartItem.productComment) {
        delete $set.productComment;
        $unset.productComment = null;
    }
    if (!cartItem.variantId) {
        delete $set.variantId;
        $unset.variantId = null;
    }
    await db.collection('cartItems').updateOne(
        {
            _id: {
                cartId,
                itemId: toId(itemId),
            }
        },
        {
            $set,
            $unset,
        },
        {
            upsert: true,
        }
    );
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
    return w.deletedCount;
});

export async function cartTrans(fn: () => Promise<Response | void>, homeAfterClear?: boolean) {
    return await dbTrans(async () => {
        const response = await fn();
        if (response) {
            const data = await response.json();
            const chartItemCount = (data.cart?.totalCartItems ?? 0) as number;
            await updateSessionToken({
                customer: {
                    chartItemCount,
                }
            });
            if (homeAfterClear && chartItemCount < 1) {
                await redirectWithMessage('/', 'There are no items in your cart. Please add some items before checking out.');
            }
            return Response.json(data, {status: response.status});
        }
        return response;
    });
}