/** 
 * https://github.com/atmulyana/nextCart
 **/
import type {TCart} from "@/data/types";

export type TCustomerAddress = {
    customerCountry?: string,
}

const domesticShippingAmount = 10;
const internationalShippingAmount = 25;
const freeThreshold = 100;
const shippingFromCountry = 'Your Country Name';

function calculateShipping(cart: TCart, session?: TCustomerAddress) {
    const amount = cart.totalCartNetAmount;
    if (amount >= freeThreshold) {
        cart.shippingMessage = 'FREE shipping';
        cart.totalCartShipping = 0;
        return;
    }

    // If there is no country set, we estimate shipping
    if (session?.customerCountry) {
        cart.shippingMessage = 'Estimated shipping';
        cart.totalCartShipping = domesticShippingAmount;
        return;
    }

    // Check for international
    if(session?.customerCountry?.toLowerCase() !== shippingFromCountry.toLowerCase()){
        cart.shippingMessage = 'International shipping';
        cart.totalCartShipping = internationalShippingAmount;
        return;
    }

    // Domestic shipping
    cart.shippingMessage = 'Domestic shipping';
    cart.totalCartShipping = domesticShippingAmount;
}

export default {
    calculateShipping,
};
