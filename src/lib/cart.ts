/** 
 * https://github.com/atmulyana/nextCart
 **/
import type {TCart, TCartItem} from '@/data/types';
import config from '@/config/usable-on-client';
import modules, {type TCustomerAddress} from './modules';

export function updateTotalCart(cart: TCart, custmerOrigin: TCustomerAddress) {
    cart.totalCartAmount = 0;
    cart.totalCartItems = 0;
    cart.totalCartProducts = 0;

    const itemIds = Object.keys(cart.items || {});
    if(itemIds.length < 1) return;

    itemIds.forEach(itemId => {
        cart.totalCartAmount += cart.items[itemId].totalItemPrice;
        cart.totalCartItems += cart.items[itemId].quantity;
    });
    cart.totalCartProducts = itemIds.length;

    // Update the total amount not including shipping/discounts
    cart.totalCartNetAmount = cart.totalCartAmount;

    // Calculate shipping if enabled
    if (modules.shipping) modules.shipping.calculateShipping(cart, custmerOrigin);

    // Calculate discount if enabled
    if(modules.discount) modules.discount.calculateDiscount(cart);

    // Calculate our total amount removing discount and adding shipping
    cart.totalCartAmount = cart.totalCartNetAmount - cart.totalCartDiscount + cart.totalCartShipping;
}

export function checkStock(cartItem: TCartItem): {message: string, constraint: number} | undefined {
    if(config.maxQuantity > 0 && cartItem.quantity > config.maxQuantity) {
        return {
            message: 'The quantity exceeds the max amount. Please contact us for larger orders.',
            constraint: config.maxQuantity,
        };
    }
    // If stock management on check there is sufficient stock for this product
    if(config.trackStock) {
        // Only if not disabled
        if(!cartItem.productStockDisable) {
            // If there is less stock than total
            if (cartItem.quantity > (cartItem.variantStock ?? cartItem.productStock)) {
                return {
                    message: 'There is insufficient stock of this product.',
                    constraint: cartItem.variantStock ?? cartItem.productStock,
                };
            }
        }
    }
}