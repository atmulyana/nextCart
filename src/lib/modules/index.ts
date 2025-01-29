/** 
 * https://github.com/atmulyana/nextCart
 **/
import discountModule from './discount-voucher';
import reviewModule from './review-basic';
import shippingModule from './shipping-basic';
import type {TCustomerAddress} from './shipping-basic';
export type {TCustomerAddress};

export type TModules = {
    discount?: typeof discountModule,
    reviews?: typeof reviewModule,
    shipping?: typeof shippingModule,
};

const modules: TModules = {
    discount: discountModule,
    reviews: reviewModule,
    shipping: shippingModule,
};
export default modules;