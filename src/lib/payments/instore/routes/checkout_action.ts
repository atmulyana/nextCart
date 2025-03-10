/** 
 * https://github.com/atmulyana/nextCart
 **/
import type {OrderStatus} from '@/data/types';
import {ObjectId} from '@/data/db-conn';
import {getCart} from '@/data/cart';
import lang from '@/data/lang';
import {createPostHandler} from '@/lib/routeHandler';
import {createOrder, getPaymentConfig} from '../../';

export const POST = createPostHandler(async (_, redirect, isFromMobile) => {
    const cart = await getCart();
    if (!cart || cart.totalCartNetAmount <= 0.0) return;
    const cfg = await getPaymentConfig('instore');
    const message = lang('Your order was successfully placed. Payment for your order will be completed instore.');
    const orderId = await createOrder(
        {
            orderTotal: cart.totalCartNetAmount,
            orderShipping: 0,
            orderPaymentId: new ObjectId().toString(),
            orderPaymentGateway: 'Instore',
            orderStatus: cfg.orderStatus.toString() as OrderStatus,
            orderPaymentMessage: lang('Your payment was successfully completed'),        
        },
        true,
        message
    );

    if (isFromMobile) {
        return Response.json({
            paymentId: orderId
        });
    }

    await redirect(
        '/payment/' + orderId,
        {
            message,
            messageType: 'success',
        }
    );
});

