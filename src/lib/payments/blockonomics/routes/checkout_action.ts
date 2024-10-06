/** 
 * https://github.com/atmulyana/nextCart
 **/
import appCfg from '@/config';
import {dbTrans} from '@/data/db-conn';
import {getCart} from '@/data/cart';
import {createPostHandler} from '@/lib/routeHandler';
import {setParams, type TSessionBlockonomics} from '../data';
import {createOrder, getPaymentConfig} from '../../';

export const POST = createPostHandler(async (_, redirect) => {
    const cart = await getCart();
    if (!cart || cart.totalCartAmount <= 0.0) return;
    const cfg = await getPaymentConfig('blockonomics');
    const blockonomicsParams: TSessionBlockonomics['blockonomicsParams'] = {
        expectedBtc: 0,
        address: '',
        timestamp: 0,
        pendingOrderId: '',
    };
    
    let response = await fetch(cfg.hostUrl.toString() + cfg.priceApi + appCfg.currencyISO)
        .then(resp => resp.json());
    blockonomicsParams.expectedBtc = Math.round(cart.totalCartAmount / response.price * Math.pow(10, 8)) / Math.pow(10, 8);

    response = await fetch(
        cfg.hostUrl.toString() + cfg.newAddressApi,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'blockonomics',
                Accept: 'application/json',
                Authorization: `Bearer ${cfg.apiKey}`,
            },
        }
    ).then(resp => resp.json());
    blockonomicsParams.address = response.address;
    blockonomicsParams.timestamp = Math.floor(new Date().getTime() / 1000);

    await dbTrans(async () => {
        const orderId = await createOrder(
            {
                orderPaymentId: blockonomicsParams.address,
                orderPaymentGateway: 'Blockonomics',
                orderExpectedBtc: blockonomicsParams.expectedBtc,        
                orderStatus: 'Pending',
            },
            false
        );
        blockonomicsParams.pendingOrderId = orderId;

        await setParams(blockonomicsParams);
    });
    return redirect('/blockonomics_payment');
});