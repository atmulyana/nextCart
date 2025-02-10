'use server';
/** 
 * https://github.com/atmulyana/nextCart
 **/
import {ObjectId} from "@/data/db-conn";
import {getCustomer, getCustomerByEmail, getCustomersByName} from "@/data/customer";
import {getOrder, getOrdersByEmail, getOrdersByName, getOrdersByValue} from "@/data/order";
import {getProduct, getProducts, getProductsByValue} from "@/data/product";
import type {TCustomer, TOrder, TProductBase, TVariant} from "@/data/types";

const emailRegex = /\S+@\S+\.\S+/;
const numericRegex = /^\d*\.?\d*$/;
const searchLimit = 5;

export async function globalSearch(formData: FormData) {
    const keywords = formData.getString('keywords');
    const ret: {
        customers?: TCustomer[],
        orders?: TOrder[],
        products?: Array<TProductBase & {variant?: TVariant}>,
        messageType: 'success',
    } = {
        messageType: 'success',
    };

    if (ObjectId.isValid(keywords)) {
        const customer = await getCustomer(keywords);
        if (customer) {
            ret.customers = [customer];
        }
        else {
            const order = await getOrder(keywords);
            if (order) {
                ret.orders = [order];
            }
            else {
                const product = await getProduct(keywords);
                if (product) {
                    ret.products = [product];
                }
            }
        }
    }
    else if (emailRegex.test(keywords)) {
        const custumer  = await getCustomerByEmail(keywords);
        if (custumer) ret.customers = [custumer];
        ret.orders = await getOrdersByEmail(keywords, searchLimit);
    }
    else if (numericRegex.test(keywords)) {
        const value = parseFloat(keywords);
        ret.orders = await getOrdersByValue(value, searchLimit);
        ret.products = await getProductsByValue(value, searchLimit);
    }
    else {
        ret.customers = await getCustomersByName(keywords, searchLimit);
        ret.orders = await getOrdersByName(keywords, searchLimit);
        ret.products = (await getProducts(1, {$text: {$search: keywords}}, searchLimit, false)).data;
    }

    //Converts the data so that it can be passed to the client component
    ret.customers?.forEach(item => {
        item._id = item._id.toString();
    });
    ret.orders?.forEach(item => {
        item._id = item._id.toString();
        delete item.orderCustomer;
        if ((item.orderPaymentId as any) instanceof ObjectId) item.orderPaymentId = item.orderPaymentId.toString();
        item.orderProducts = {};
    });
    ret.products?.forEach(item => {
        item._id = item._id.toString();
        if (item.variants && item.variants.length > 0) {
            item.productPrice = item.variants[0].price;
        }
        delete item.variants;
        if (item.variant) {
            item.variant._id = item.variant._id.toString();
            item.variant.product = item.variant.product.toString();
        }
    });

    return ret;
}