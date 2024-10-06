/** 
 * https://github.com/atmulyana/nextCart
 **/
import React from 'react';
import type {Metadata, ResolvingMetadata} from 'next';
import {headers} from 'next/headers';
import {notFound} from 'next/navigation';
import lang from '@/data/lang';
import {getRouteModule} from '@/lib/payments';
import {getCart} from '@/data/cart';
import {getSession} from '@/data/session';
import Template from '@/subview/partials/Template';

export async function generateMetadata(props: any, parent: ResolvingMetadata) {
    let metadata: Metadata = {};
    const mod = await getRouteModule(headers());
    if (mod.generateMetadata) {
        const meta = mod.generateMetadata(props, parent);
        metadata =  (meta instanceof Promise) ? (await meta) : meta; 
    }
    else if (mod.metadata) {
        metadata = mod.metadata;
    }
    return {
        title: `${lang('Checkout', 1)} - ${lang('Payment')}`,
        ...metadata,
    };
};

export default async function Payment() {
    const mod = await getRouteModule(headers());
    if (!mod.Page) return notFound();
    const cart = await getCart();
    // if (!cart || cart.totalCartAmount <= 0.0) return notFound();
    const session = await getSession();
    return <Template>
        <mod.Page cart={cart} session={session} />
    </Template>;
}