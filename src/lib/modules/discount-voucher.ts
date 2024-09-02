/** 
 * https://github.com/atmulyana/nextCart
 **/
import type {TCart, TDiscount} from "@/data/types";
import {getDiscountByCode} from '@/data/discount';

async function calculateDiscount(cart: TCart) {
    let discountAmount = 0;
    let discount: TDiscount | undefined | null;
    if (typeof(cart.discount) == 'string') {
        discount = await getDiscountByCode(cart.discount)
        if (!discount) /* Invalid code */ delete cart.discount;
    }
    else if (cart.discount) {
        discount = cart.discount;
    }
    if (discount) {
        const now = Date.now();
        if (discount.start.getTime() <= now && now <= discount.end.getTime()) {
            if (discount.type == 'amount'){
                discountAmount = discount.value;
            }
            else if (discount.type == 'percent'){
                discountAmount = (discount.value / 100) * cart.totalCartNetAmount;
            }
        }
    }
    cart.totalCartDiscount = discountAmount;
    return discountAmount;
}

export default {
    calculateDiscount,
};
