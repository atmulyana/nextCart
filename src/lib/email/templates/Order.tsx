/** 
 * https://github.com/atmulyana/nextCart
 **/
import React from 'react';
import config from '@/config';
import lang from '@/data/lang';

export default function EmailOrder({
    message,
    approved = true,
    orderId,
    transactionId,
}: {
    message?: string,
    approved?: boolean,
    orderId?: string,
    transactionId?: string,
}) {
    return <div className="wrapper">
        <div className="container">
            <div className="panel panel-default">
                <div className="panel-heading">
                    <img id="logo" src={`${config.baseUrl}/images/logo.svg`} />
                    <h1>{config.cartTitle}</h1>
                </div>
                <div className="panel-body">
                    <h3 className={approved ? 'text-success' : 'text-danger'}>{message ?? lang('Your payment was successfully completed')}</h3>
                    {orderId && <p><strong>{lang('Order ID')}: </strong>{orderId}</p>}
                    {transactionId && <p><strong>{lang('Transaction ID')}: </strong>{transactionId}</p>}
                    <h4>{lang('Thanks for shopping with us. We hope you will shop with us again soon.')}</h4>
                </div>
            </div>
        </div>
    </div>;
}