/** 
 * https://github.com/atmulyana/nextCart
 **/
import React from 'react';
import appCfg from '@/config';
import type {_Id, TOrder, TSessionCustomer, WithoutId} from '@/data/types';
import {cartTrans, deleteCart, getCart} from '@/data/cart';
import lang from '@/data/lang/server';
import * as order from '@/data/order';
import {getSession} from '@/data/session';
import {getStock, updateStock} from '@/data/product';
import type {Metadata, ResolvingMetadata} from 'next';
import {getGatewayPath, getRoute} from './routes';
import {
    type Config,
    type Configs,
    type FormComponent,
    PublicString,
    type PaymentComponent,
    type PaymentCompleteComponent,
    type RouteHandler
} from './types';
import {sendEmail} from '../email';
import OrderEmail from '../email/templates/Order';


export async function getPaymentConfig<T extends (string| undefined)>(gateway?: T): Promise<undefined extends T ? Configs : Config> {
    const gateways = gateway ? [gateway] : appCfg.paymentGateway;
    const configs: Configs = {};
    for (let gateway of gateways) {
        const _config = (await import(/* webpackMode: "eager" */`./${gateway}/config`)).default as Config;
        const config = {..._config};
        try {
            const localConfig = await import(/* webpackMode: "eager" */`./${gateway}/config-local.json`) as Config;
            for (let name in localConfig) {
                if (config[name] instanceof PublicString) config[name] = new PublicString(localConfig[name]);
                else config[name] = localConfig[name];
            }
        }
        catch {}
        configs[gateway] = config;
    }
    return (gateway ? configs[gateway] : configs) as (undefined extends T ? Configs : Config);
}

export async function getPublicPaymentConfig<T extends (string | Config | undefined)>(gateway?: T): Promise<undefined extends T ? Configs : Config> {
    const getPublic = (config: Config) => {
        const publicConfig: Config = {
            description: config.description,
            buttonText: config.buttonText,
        };
        for (let name in config) {
            if (config[name] instanceof PublicString) publicConfig[name] = config[name].toString();
        }
        return publicConfig;
    }

    if (typeof(gateway) == 'object') return (getPublic(gateway) as any);
    
    const gateways = gateway ? [gateway as string] : appCfg.paymentGateway;
    const configs: Configs = {};
    for (let gw of gateways) {
        configs[gw] = await getPaymentConfig(gw);
    }
    return (gateway ? configs[gateway as string] : configs) as any;
}

export async function getPaymentModule(gateway: string) {
    const config = await getPaymentConfig(gateway);
    let PaymentComplete: PaymentCompleteComponent | undefined;
    try {
        PaymentComplete = (await import(/* webpackMode: "eager" */`./${gateway}/PaymentComplete`)).default as PaymentCompleteComponent;
    }
    catch {}

    return {
        config,
        publicConfig: await getPublicPaymentConfig(config),
        Form: (await import(/* webpackMode: "eager" */`./${gateway}/Form`)).default as FormComponent,
        PaymentComplete,
    }
}

export async function getForms() {
    const gateways = appCfg.paymentGateway;
    const forms: Array<React.ReactElement<FormComponent>> = [];
    for (let gw of gateways) {
        const {Form, publicConfig} = await getPaymentModule(gw);
        forms.push(<Form {...publicConfig} />);
    }
    return forms;
}

export async function getRouteModule(requestHeaders: Headers) {
    const mod: {
        GET?: RouteHandler,
        POST?: RouteHandler,
        metadata?: Metadata,
        generateMetadata?: (props: {params: any, searchParams: any}, parent: ResolvingMetadata) => Promise<Metadata> | Metadata,
        getData?: () => any,
        Page?: PaymentComponent,
    } = {};
    const path = getGatewayPath(requestHeaders);
    if (!path) return mod;
    const route = await getRoute(path);
    if (!route) return mod;
    if (route.type == 'route') {
        const _mod = await import(/* webpackMode: "eager" */`./${route.gateway}/routes/${route.routeName}`);
        if (_mod.GET) mod.GET = _mod.GET as RouteHandler;
        if (_mod.POST) mod.POST = _mod.POST as RouteHandler;
    }
    else if (route.type == 'page') {
        const _mod = await import(/* webpackMode: "eager" */`./${route.gateway}/routes/${route.routeName}`);
        if (typeof(_mod.getData) == 'function') mod.getData = _mod.getData;
        if (typeof(_mod.metadata) == 'object') mod.metadata = _mod.metadata;
        if (typeof(_mod.generateMetadata) == 'function') mod.generateMetadata = _mod.generateMetadata;
        if (typeof(_mod.default) == 'function') mod.Page = _mod.default;
    }
    return mod;
}

async function updateOrderedStock(data: TOrder['orderProducts']) {
    if (appCfg.trackStock) {
        Object.keys(data).forEach(async (productKey) => {
            const product = data[productKey];
            const currentStock = await getStock(product.productId, product.variantId) || 0;
            let newStock = currentStock - product.quantity;
            if (newStock < 1) newStock = 0;
            await updateStock(product, newStock, currentStock);
        });
    }
}

function emailNotif(to: string, orderId: _Id, transactionId: string, message?: string | null, approved: boolean = true) {
    sendEmail(
        to,
        `${lang('Your order with')} ${appCfg.cartTitle}`,
        <OrderEmail orderId={orderId.toString()} transactionId={transactionId} message={message} approved={approved} />
    );
}

type OrderData = {
    orderPaymentId: TOrder['orderPaymentId'],
    orderPaymentGateway: TOrder['orderPaymentGateway'],
    orderStatus: TOrder['orderStatus'],
    [p: string]: any,
}

export async function createOrder(data: OrderData, approved?: boolean, emailMessage?: string | null, session?: WithoutId<TSessionCustomer>) {
    let orderId!: _Id;
    await cartTrans(async () => {
        const cart = await getCart();
        if (!cart) throw 'There are no items in your cart. Please add some items before checking out';
        session ??= await getSession();
        const ord: WithoutId<TOrder> = {
            orderTotal: cart.totalCartAmount,
            orderShipping: cart.totalCartShipping,
            orderItemCount: cart.totalCartItems,
            orderProductCount: cart.totalCartProducts,
            orderCustomer: session.customerId,
            orderEmail: session.customerEmail as string,
            orderCompany: session.customerCompany,
            orderFirstname: session.customerFirstname,
            orderLastname: session.customerLastname,
            orderAddr1: session.customerAddress1,
            orderAddr2: session.customerAddress2,
            orderCountry: session.customerCountry,
            orderState: session.customerState,
            orderPostcode: session.customerPostcode,
            orderPhoneNumber: session.customerPhone,
            orderComment: cart.orderComment,
            orderDate: new Date(),
            orderType: 'Single',
            ...data,
            orderProducts: cart.items,
        }
        if (approved && appCfg.trackStock) ord.productStockUpdated = true;
        orderId = await order.createOrder(ord);
        if (approved) {
            await updateOrderedStock(ord.orderProducts);
            await deleteCart();
            emailNotif(ord.orderEmail, orderId, data.orderPaymentId.toString(), emailMessage);
        }
        else if (typeof(emailMessage) == 'string') {
            emailNotif(ord.orderEmail, orderId, data.orderPaymentId.toString(), emailMessage, false);
        }
    });
    return orderId;
}

export enum ApprovalStatus {
    Declined = 0,
    Approved = 1,
    Completed = 2,
};

export async function updateOrder(id: _Id, data: Partial<OrderData>, status?: ApprovalStatus) {
    await cartTrans(async () => {
        const ord = await order.getOrder(id);
        if (!ord) return;
        //eslint-disable-next-line @typescript-eslint/no-unused-vars
        const {orderProducts, ...data2} = data;
        if (status == ApprovalStatus.Approved && appCfg.trackStock) data2.productStockUpdated = true;
        await order.updateOrder(id, data2);
        if (status) {
            await deleteCart();
            if (status == ApprovalStatus.Approved) {
                if (!ord.productStockUpdated) await updateOrderedStock(ord.orderProducts);
                emailNotif(ord.orderEmail, id, (data.orderPaymentId ?? ord.orderPaymentId).toString());
            }
            return Response.json({}); //sets `chartItemCount` in session token to 0 
        }
    });
}