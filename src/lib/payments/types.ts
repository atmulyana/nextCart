/** 
 * https://github.com/atmulyana/nextCart
 **/
import * as React from 'react';
import type {TCart, TOrder, TSession} from '@/data/types';

export type Config = {
    description: string,
    buttonText: string,
    [name: string]: string | String,
};

export type Configs = {
    [gateway: string]: Config,
}

export class PublicString extends String {
}

export type FormComponent = React.ComponentType<Config>;
export type PaymentComponent = React.ComponentType<{cart: TCart, order: TOrder, session: TSession}>;
export type PaymentCompleteComponent = React.ComponentType<{order: TOrder}>;

export type RouteHandler = (request: Request) => Promise<Response | undefined>;
export type RouteType = 'route' | 'page';
export type GatewayRoutes = {
    [path: string]: RouteType | {type: RouteType, mapPath?: string},
};
export type Routes = {
    [path: string]: {type: RouteType, gateway: string, routeName: string},
};