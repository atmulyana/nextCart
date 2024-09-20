/** 
 * https://github.com/atmulyana/nextCart
 **/
import paypal, {type ConfigureOptions, type Payment} from 'paypal-rest-sdk';
import config from '@/config';
import {getCart} from '@/data/cart';
import lang from '@/data/lang';
import {redirectWithMessage} from '@/lib/auth';
import {createPostHandler} from '@/lib/routeHandler';
import {setPaymentId} from '../data';
import {getPaymentConfig} from '../../';

export const POST = createPostHandler(async (_, redirect, isFromMobile) => {
    const paypalConfig = await getPaymentConfig('paypal');
    const cart = await getCart();
    if (!cart || cart.totalCartAmount <= 0.0) return;
    //if (!cart) return redirectWithMessage('/', lang('There are no items in your cart. Please add some items before checking out.'));

    const payment: Payment = {
        intent: 'sale',
        payer: {
            payment_method: 'paypal'
        },
        redirect_urls: {
            return_url: `${config.baseUrl}/paypal/checkout_return`,
            cancel_url: `${config.baseUrl}/paypal/checkout_cancel`
        },
        transactions: [{
            amount: {
                total: cart.totalCartAmount.toString(),
                currency: paypalConfig.paypalCurrency.toString(),
            },
            description: paypalConfig.paypalCartDescription.toString(),
        }]
    };
    paypal.configure((paypalConfig as unknown) as ConfigureOptions);

    let obj: {message?: string, redirectUrl?: string} = {};
    try {
        obj = await new Promise<typeof obj>((resolve, reject) => {
            try {
                paypal.payment.create(payment, async (error, payment) => {
                    if (error) {
                        resolve({
                            message: `${lang('There was an error processing your payment')}. ${lang('You have not been charged and can try again')}.`,
                        });
                    }
                    if(payment.payer.payment_method == 'paypal'){
                        let redirectUrl: string | undefined;
                        if (payment.links) {
                            for(let link of payment.links) {
                                if(link.method == 'REDIRECT') {
                                    redirectUrl = link.href;
                                }
                            }
                        }
                        
                        if (!redirectUrl || !payment.id || !(await setPaymentId(payment.id))) reject('Error');
                        else resolve({redirectUrl});
                    }
                });
            }
            catch (ex) {
                reject(ex);
            }
        });
    }
    catch {
        obj.message = lang('Paypal error');
    }

    if (typeof(obj.redirectUrl) == 'string') return redirect(obj.redirectUrl, {base: '__OUTSIDE__'});
    else if (isFromMobile) return Response.json(obj);
    else return redirectWithMessage('/checkout/payment', obj.message || '');
});