/** 
 * https://github.com/atmulyana/nextCart
 **/
import type {TCart, TCartItem, TVariant} from '@/data/types';
import lang from '@/data/lang';
import {cartTrans, getCart, upsertCart, upsertCartItem} from '@/data/cart';
import {getProduct} from '@/data/product';
import {getSession} from '@/data/session';
import {checkStock, updateTotalCart} from '@/lib/cart';
import {ResponseMessage} from '@/lib/common';
import {createPostHandler} from '@/lib/routeHandler';

export const POST = createPostHandler(async (formData, redirect, isFromMobile) => {
    return await cartTrans(async () => {
        const cartWithId = await getCart();
        const session = await getSession();
        const {_id: _cartId, ...cart} = cartWithId ?? {
            _id: void 0,
            items: {} as Record<string, TCartItem>,
            totalCartNetAmount: 0,
            totalCartDiscount: 0,
            totalCartShipping: 0,
            totalCartAmount: 0,
            totalCartItems: 0,
            totalCartProducts: 0,
        };
        
        const productId = formData.getString('productId');
        const productVariant = formData.getString('productVariant');
        const cartItemId = productVariant || productId;
        let productQuantity = formData.getNumber('productQuantity') || 1;
        productQuantity = (productQuantity < 1) ? 1 : Math.floor(productQuantity);
        const productComment = formData.getString('productComment');
        let oriCartItem: TCartItem | undefined;

        const response = (message: string, {
            status = 400,
            totalCartItems = cart.totalCartItems,
            _cart = cart,
            ...props
        } : {
            status?: number,
            totalCartItems?: number,
            _cart?: TCart,
            [p: string]: any,
        } = {}) => {
            if (status != 200) {
                if (oriCartItem) _cart.items[cartItemId] = oriCartItem;
                else delete _cart.items[cartItemId];
            }

            return ResponseMessage(
                message,
                {
                    status,
                    totalCartItems,
                    cart: isFromMobile ? null : _cart,
                    ...props
                }
            );
        }

        const product = await getProduct(productId);
        if (!product) {
            return response(lang('Error updating cart. Product not found.'), {status: 404});
        }
        if (product.productPublished === false) {
            return response(lang('Error updating cart. Product not published.'));
        }
        let variant: TVariant | undefined;
        if (productVariant) {
            variant = product.variants?.find(variant => variant._id.toString() == productVariant);
            if (!variant) {
                return response(lang('Error updating cart. Variant not found.'), {status: 404});
            }
        }
        
        let cartItem: TCartItem;
        if (cart.items[cartItemId]) {
            cartItem = cart.items[cartItemId];
            oriCartItem = {...cartItem};
        }
        else { //new product/variant added into cart
            const itemCount = Object.keys(cart.items).length;
            if (itemCount == 1 && Object.values(cart.items)[0].productSubscription) { //a subscription product has been in the cart (must be the only one)
                return response(lang('Subscription already existing in cart. You cannot add more.'));
            }
            else if (itemCount > 0 && product.productSubscription) {
                return response(lang('You cannot combine subscription products with existing in your cart. Empty your cart and try again.'));
            }
            
            cartItem = {
                productId: product._id,
                title: product.productTitle,
                link: product.productPermalink || product._id.toString(),
                productImage: `/product/${product._id.toString()}/image`,
                quantity: 0,
                totalItemPrice: 0,
                productStock: product.productStock,
                productStockDisable: product.productStockDisable,
                productSubscription: product.productSubscription,
                variantId: variant?._id,
                variantTitle: variant?.title,
                variantStock: variant?.stock,
            };
            cart.items[cartItemId] = cartItem;
        }
        cartItem.quantity += productQuantity;
        cartItem.totalItemPrice = cartItem.quantity * (variant?.price ?? product.productPrice);
        cartItem.productComment = productComment;

        const check = checkStock(cartItem);
        if (check) return response(lang(check.message));

        await updateTotalCart(cart, session);

        const cartId = _cartId || session._id;
        await upsertCart(cartId, cart);
        await upsertCartItem(cartId, cartItemId, cartItem);
        return response(
            lang('Cart successfully updated'),
            {
                status: 200,
                cartId,
                messageType: 'success',
            }
        );
    },
    formData.has('homeAfterClear'));
});