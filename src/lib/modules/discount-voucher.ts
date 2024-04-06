/** 
 * https://github.com/atmulyana/nextCart
 **/
import type {TCart, TDiscount} from "@/data/types";

async function calculateDiscount(cart: TCart) {
    let discountAmount = 0;
    let discount: TDiscount | undefined;
    if (typeof(cart.discount) == 'string') {
        let url = '/checkout/adddiscountcode';
        if (typeof(location) != 'object' || !('href' in location)) { //server-side
            const hdrs = (await import('next/headers')).headers();
            const host = hdrs.get('host') as string, proto = hdrs.get('x-forwarded-proto') as string;
            url = `${proto}://${host}${url}`;
        }
        const params = new FormData();
        params.append('discountCode', cart.discount);
        const response = await fetch(url, {
            method: "POST",
            body: params
        });
        if (response.ok) {
            const data = await response.json() as {discount?: TDiscount};
            discount = data.discount;
        }
        if (typeof(discount) == 'undefined') /* Invalid code */ delete cart.discount;
    }
    if (typeof(discount) == 'object') {
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
