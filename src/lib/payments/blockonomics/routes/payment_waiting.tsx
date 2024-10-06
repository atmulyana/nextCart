/** 
 * https://github.com/atmulyana/nextCart
 **/
import {notFound} from 'next/navigation';
import lang from '@/data/lang';
import Breadcrumb from '@/subview/components/Breadcrumb';
import {Cart} from '@/subview/components/Cart';
import type {TCart, TSession} from '@/data/types';
import {currencySymbol, formatAmount} from '@/lib/common';
import {getPaymentConfig} from '../../';
import {getParams} from '../data';
import Waiting, {CopyLink} from './WaitingOnClient';

export async function getData() {
    return {
        session: {
            blockonomicsParams: await getParams(),
        },
    };
}

export default async function CheckoutBlockonomics({
    cart,
    session,
}: {
    cart?: TCart,
    session: TSession,
}) {
    const params = await getParams();
    if (!params) return notFound();
    const cfg = await getPaymentConfig('blockonomics');

    return <div className='basis-full md:basis-5/6 mx-auto'>
        <Breadcrumb
            homeText={lang('Home')}
            items={[
                {
                    text: lang('Information'),
                    path: '/checkout/information'
                },
                {
                    text: lang('Shipping'),
                    path: '/checkout/shipping'
                },
                {
                    text: lang('Payment'),
                    path: '/checkout/payment'
                },
                {
                    text: lang('BTC Address'),
                    path: '/blockonomics_payment',
                },
            ]}
        />
        <div className='flex flex-wrap justify-center -mx-4'>
            <div className='checkout-left-pane px-4'>
                <h5 className='mb-3'>{lang('Blockonomics payment details')}</h5>
                <div className='bordered !py-3'>
                    {session.customerFirstname} {session.customerLastname} - {session.customerEmail}
                </div>
                {cart && cart.totalCartShipping > 0 && <div className='bordered !py-3 flex flex-wrap'>
                    <span className='basis-full md:basis-1/2 shrink-0 grow-0'>{lang(cart.shippingMessage ?? '-')}</span>
                    <strong className='basis-full md:basis-1/2 shrink-0 grow-0'>{currencySymbol()}{formatAmount(cart.totalCartShipping)}</strong>
                </div>}
                <div className='bordered !py-3 flex flex-wrap'>
                    <span className='basis-full md:basis-1/2 shrink-0 grow-0'>{lang('Send BTC amount')}</span>
                    <div className='basis-full md:basis-1/2 shrink-0 grow-0'>
                        <strong id='expectedBtc'>{params.expectedBtc}</strong>
                        <CopyLink sourceId='expectedBtc' className='btn btn-sm btn-outline-primary float-right' title={lang('Copy')} />
                    </div>
                </div>
                <div className='bordered !py-3'>
                    {lang('Address')}:<br/>
                    <div>
                        <strong id='btcAddress'>{params.address}</strong>
                        <CopyLink sourceId='btcAddress' className='btn btn-sm btn-outline-primary float-right' title={lang('Copy')} />
                    </div>
                </div>
                <div className='bordered !py-3 flex flex-wrap'>
                    <Waiting
                        blUrl={cfg.hostUrl.replace(/^https:/, 'wss:') + '/payment/'}
                        params={params}
                        text={{
                            alreadyPaid: lang('If you already paid, your order will be processed automatically'),
                            clickHere: lang('Click here'),
                            detected: lang('Payment detected'),
                            expired: lang('Payment time expired'),
                            order: lang('Order'),
                            retry: lang('to try again'),
                            time: lang('${time} left'),
                            view: lang('View'),
                            waiting: lang('Waiting for payment'),
                        }}
                    />
                </div>
            </div>
            <div className='checkout-right-pane px-4'>
                <Cart readonly
                    title={lang('Cart contents')}
                    emptyText={lang('Empty cart')}
                    optionText={lang('Option')}
                    qtyText={lang('Quantity')}
                    discountText={lang('Discount')}
                    totalText={lang('Total')}
                />
            </div>
        </div>
    </div>;
}