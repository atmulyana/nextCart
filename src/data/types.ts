/** 
 * https://github.com/atmulyana/nextCart
 **/
import type {Binary, Document, ObjectId, WithId, WithoutId} from 'mongodb';

export type {WithId, WithoutId};
export type WithObjectId<T> = Omit<T, '_id'> & {_id: ObjectId}; 
export type _Id = string | ObjectId;
export type {Document, ObjectId};

export type TCart = {
    orderComment?: string,
    items: Record<string, TCartItem>,
    discount?: string | TDiscount,
    shippingMessage?: string,
    totalCartNetAmount: number,
    totalCartDiscount: number,
    totalCartShipping: number,
    totalCartAmount: number,
    totalCartItems: number,
    totalCartProducts: number,
}

export type TCartItemBase = {
    productId: _Id,
    productComment?: string,
    quantity: number,
    variantId?: _Id,
};

export type TCartItem = TCartItemBase & {
    title: string,
    link: string,
    productImage: string,
    productStock: number,
    productStockDisable?: boolean,
    productSubscription?: string,
    totalItemPrice: number,
    variantTitle?: string,
    variantStock?: number,
}

export type TCustomer = {
    _id: _Id,
    email: string,
    password: string,
    company: string,
    firstName: string,
    lastName: string,
    address1: string,
    address2: string,
    country: string,
    state: string,
    postcode: string,
    phone: string,
    resetToken?: string,
    resetTokenExpiry?: number,
    created?: Date,
}

export type TDiscount = {
    code: string,
    type: "percent" | "amount",
    value: number,
    start: Date,
    end: Date,
}

export type TMenu = {
    _id: number,
    title: string,
    link: string,
    order: number,
}

export const OrderStatusMap = {
    Approved: false,
    'Approved - Processing': false,
    Cancelled: true,
    Completed: true,
    Created: false,
    Declined: true,
    Failed: false,
    Paid: true,
    Pending: true,
    Shipped: true,
};

export type OrderStatus =  keyof typeof OrderStatusMap;
export type TOrder = {
    _id: _Id,
    orderPaymentId: _Id,
    orderPaymentGateway: string,
    orderTotal: number,
    orderShipping: number,
    orderItemCount: number,
    orderProductCount: number,
    orderCustomer?: ObjectId,
    orderEmail: string,
    orderCompany?: string,
    orderFirstname?: string,
    orderLastname?: string,
    orderAddr1?: string,
    orderAddr2?: string,
    orderCountry?: string,
    orderState?: string,
    orderPostcode?: string,
    orderPhoneNumber?: string,
    orderComment?: string,
    orderStatus: OrderStatus,
    orderDate: Date,
    orderProducts: Record<string, TCartItem>,
    orderType: 'Single' | 'Subscription',
    productStockUpdated?: boolean,
    [p: string]: any,
}

export type TPage = {
    _id: ObjectId,
    content: string,
    enabled: boolean,
    name: string,
    slug: string,
}

export type TProductBase = {
    _id: _Id,
    productPermalink: string,
    productTitle: string,
    productPrice: number,
    productPublished?: boolean,
    variants?: TVariant[],
};

export type TProductInsert = TProductBase & {
    productDescription: string,
    productComment?: boolean,
    productStock?: number,
    productStockDisable?: boolean,
    productSubscription?: string,
    productGtin?: string,
    productBrand?: string,
    tags?: string[],
};

export type TProduct = TProductInsert & {
//    images: TProductImage[],
    productAddedDate: Date,
    imageCount: number,
    imgaeDefaultIndex?: number,
}

export type TProductImage = {
    content: Binary,
    type: string,
    default: boolean,
}

export type TProductImagePath = {
    id: number,
    path: string,
    productImage: boolean, //default image or not
}

export type TProductItem = TProductBase & {
    productImage: string,
}

export interface TSessionBasic {
    _id: ObjectId;
    expires: Date;
}

export interface TSessionCustomer {
    _id: ObjectId;
    customerId?: ObjectId;
    customerEmail?: string;
    customerCompany?: string;
    customerFirstname?: string;
    customerLastname?: string;
    customerAddress1?: string;
    customerAddress2?: string;
    customerCountry?: string;
    customerState?: string;
    customerPostcode?: string;
    customerPhone?: string;
}

export interface TSessionUser {
    _id: ObjectId;
    userId?: ObjectId;
    user?: string;
    usersName?: string;
    isAdmin?: boolean;
    isOwner?: boolean;
}

export class TSession implements TSessionBasic, TSessionCustomer, TSessionUser {
    _id!: ObjectId;
    expires!: Date;
    cart?: TCart;
    get customerPresent(): boolean {return !!this.customerEmail}
    customerId?: ObjectId;
    customerEmail?: string;
    customerCompany?: string;
    customerFirstname?: string;
    customerLastname?: string;
    customerAddress1?: string;
    customerAddress2?: string;
    customerCountry?: string;
    customerState?: string;
    customerPostcode?: string;
    customerPhone?: string;
    get userPresent(): boolean {return !!this.userId}
    userId?: ObjectId;
    user?: string;
    usersName?: string;
    isAdmin?: boolean;
    isOwner?: boolean;
}

export type TUser = {
    _id: ObjectId,
    usersName: string,
    userEmail: string,    
    userPassword: string,
    isAdmin: boolean,
    isOwner: boolean,
};

export type TVariant = {
    _id: _Id,
    title: string,
    price: number,
    stock?: number,
    imageIdx?: number,
    product?: _Id,
}