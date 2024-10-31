/** 
 * https://github.com/atmulyana/nextCart
 **/
import {NextRequest} from 'next/server';
import appCfg from '@/config/usable-on-client';
import type {GatewayRoutes, Routes, RouteType} from './types';
import {isFromMobile} from '../auth/common';

let routes: Routes | undefined;
const HEADER_NAME = 'x-payment-url';

export async function getRoute(path: string): Promise<Routes[string] | undefined> {
    if (!routes) {
        routes = {};
        for (let gw of appCfg.paymentGateway) {
            const gwroutes = (await import(/* webpackMode: "eager" */`./${gw}/routes`)).default as GatewayRoutes;
            for (let name in gwroutes) {
                let path =`/${gw}/${name}`;
                let type: RouteType;
                const gwopt = gwroutes[name];
                if (typeof(gwopt) == 'object') {
                    type = gwopt.type;
                    if (gwopt.mapPath) path = gwopt.mapPath;
                }
                else {
                    type = gwopt;
                }
                routes[path] = {type, gateway: gw, routeName: name};
            }
        }
    }
    return routes[path];
}

export async function newUrl(request: NextRequest) {
    const path = request.nextUrl.pathname;
    const route = await getRoute(path)
    if (route) {
        request.headers.set(HEADER_NAME, path);
        if (route.type == 'route') return '/checkout/payment/gateway';
        else { //page
            if (await isFromMobile(request.headers)) return '/payment/data';
            return '/payment';
        }
    }
}

export function getGatewayPath(requestHeaders: Headers) {
    return requestHeaders.get(HEADER_NAME);
}

export default routes;