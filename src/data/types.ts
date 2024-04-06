/** 
 * https://github.com/atmulyana/nextCart
 **/
import type {Binary, ObjectId, WithId} from 'mongodb';

export type {WithId};
export type _Id = string | ObjectId;

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

export type TCartItem = {
    productId: _Id,
    title: string,
    link: string,
    productImage: string,
    quantity: number,
    totalItemPrice: number,
    productStock: number,
    productStockDisable?: boolean,
    productSubscription?: string,
    productComment?: string,
    variantId?: _Id,
    variantTitle?: string,
    variantStock?: number,
}

export type TCustomer = {
    _id: ObjectId,
    email: string,
    firstName: string,
    lastName: string,
    address1: string,
    address2: string,
    country: string,
    state: string,
    postcode: string,
    phone: string,
    password: string,
    company: string,
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

type TProductBase = {
    _id: ObjectId,
    productPermalink: string,
    productTitle: string,
    productPrice: number,
    productPublished?: boolean,
    variants?: TVariant[],
}

export type TProduct = TProductBase & {
    productDescription: string,
    productComment?: boolean,
    productAddedDate: Date,
    productStock: number,
    productStockDisable?: boolean,
    productSubscription: string,
    tags: string[],
//    images: TProductImage[],
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
    lastAccess: Date;
}

export interface TSessionBlockonomics {
    blockonomicsParams?: {
        expectedBtc: number,
        address: string,
        timestamp: number,
        pendingOrderId: ObjectId,
    };
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

export class TSession implements TSessionBasic, TSessionCustomer, TSessionUser, TSessionBlockonomics {
    constructor() {
        this.lastAccess = new Date();
    }

    _id!: ObjectId;
    lastAccess: Date;
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
    blockonomicsParams?: TSessionBlockonomics['blockonomicsParams'];
}

export type TUser = {
    id: ObjectId,
    usersName: string,
    userEmail: string,    
    userPassword: string,
    isAdmin: boolean,
    isOwner: boolean,
};

export type TVariant = {
    _id: ObjectId,
    title: string,
    price: number,
    stock: number,
    product: ObjectId,
}