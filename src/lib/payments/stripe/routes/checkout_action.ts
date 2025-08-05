/** 
 * https://github.com/atmulyana/nextCart
 **/
import numeral from 'numeral';
import Stripe from 'stripe';
import type {NotificationParam} from '@/components/Notification';
import {getCart} from '@/data/cart';
import lang from '@/data/lang/server';
import {getSession} from '@/data/session';
import {ResponseMessage} from '@/lib/common';
import {createPostHandler} from '@/lib/routeHandler';
import {createOrder, getPaymentConfig} from '../../';

export const POST = createPostHandler(async (formData, redirect, isFromMobile) => {
    const cart = await getCart();
    if (!cart || cart.totalCartAmount <= 0.0) return;
    const session = await getSession();
    const cfg = await getPaymentConfig('stripe');
    const stripe = new Stripe(cfg.secretKey.toString());

    const chargePayload = {
        amount: parseInt(numeral(cart.totalCartAmount).format('0.00').replace('.', '')),
        currency: cfg.stripeCurrency.toLowerCase(),
        source: formData.getString('token'),
        description: cfg.stripeDescription.toString(),
        shipping: {
            name: `${session.customerFirstname} ${session.customerFirstname}`,
            address: {
                line1: session.customerAddress1,
                line2: session.customerAddress2,
                postal_code: session.customerPostcode,
                state: session.customerState,
                country: session.customerCountry
            }
        }
    };

    let charge: Stripe.Charge;
    try {
        charge = await stripe.charges.create(chargePayload);
    }
    catch {
        return ResponseMessage(`${lang('Your payment was declined')}. ${lang('Please try again')}`);
    }
    
    const orderId = await createOrder(
        {
            orderPaymentId: charge.id,
            orderPaymentGateway: 'Stripe',
            orderStatus: charge.paid ? 'Paid' : 'Declined',
            orderPaymentMessage: charge.outcome?.seller_message,        
        },
        charge.paid
    );

    const messageObj: {message: string, messageType: NotificationParam['type']} = charge.paid
        ? {
            message: lang('Your payment was successfully completed'),
            messageType: 'success'
        }
        : {
            message: `${lang('Your payment was declined')}. ${lang('Please try again')}`,
            messageType: 'danger'
        };
    
    if (isFromMobile) {
        return Response.json({
            paymentId: orderId,
            ...messageObj
        });
    }

    await redirect(
        '/payment/' + orderId,
        messageObj
    );
});

