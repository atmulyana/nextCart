/** 
 * https://github.com/atmulyana/nextCart
 **/
import paypal from 'paypal-rest-sdk';
import type {OrderStatus} from '@/data/types';
import {dbTrans} from '@/data/db-conn';
import lang from '@/data/lang';
import {ResponseMessage} from '@/lib/common';
import {createGetHandler} from '@/lib/routeHandler';
import type {NotificationParam} from '@/subview/components/Notification';
import {getPaymentId, clearPaymentId} from '../data';
import {createOrder} from '../../';

export const GET = createGetHandler<{}, {paymentId: string, PayerID: string}>(async (
    {
        redirect,
        searchParams: {paymentId, PayerID}
    }
) => {
    const _paymentId = await getPaymentId();
    if (!PayerID || !_paymentId || paymentId != _paymentId) return ResponseMessage(lang('Forbidden'), 403);
    
    const obj = await dbTrans(async () => {
        await clearPaymentId();

        return await new Promise<Partial<NotificationParam> & {redirectUrl?: string}>((resolve, reject) => {
            try {
                paypal.payment.execute(paymentId, {payer_id: PayerID}, async (error, payment) => {
                    let approved = false,
                        emailMessage = '',
                        paymentStatus: OrderStatus = 'Approved';
                    
                    if (error) {
                        resolve({
                            message: error.response.message,
                            type: 'danger',
                        });
                    }
            
                    // fully approved
                    if (payment.state == 'approved') {
                        approved = true;
                        emailMessage = lang('Your payment was successfully completed');
                        paymentStatus = 'Paid';
                    }
            
                    // failed
                    if (payment.failure_reason) {
                        approved = false;
                        emailMessage = `${lang('Your payment was failed')} - ${payment.failure_reason}`;
                        paymentStatus = 'Declined';
                    }

                    const orderId = await createOrder(
                        {
                            orderPaymentId: paymentId,
                            orderPaymentGateway: 'Paypal',
                            orderStatus: paymentStatus,
                        },
                        approved,
                        emailMessage
                    );

                    resolve({
                        message: emailMessage,
                        type: approved ? 'success' : 'danger',
                        redirectUrl: '/payment/' + orderId.toString(),
                    });
                });
            }
            catch (ex) {
                reject(ex);
            }
        });
    });

    if (obj.message) {
        return await redirect(
            obj.redirectUrl || '/checkout/payment',
            {
                message: obj.message,
                messageType: obj.type || 'danger',
            }
        );
    }
    else {
        return redirect(obj.redirectUrl || '/checkout/payment')
    }
});