/** 
 * https://github.com/atmulyana/nextCart
 **/
import type {GatewayRoutes} from '../../types';

export default {
    checkout_action: 'route',
    checkout_return: 'route',
    payment_waiting: {
        type: 'page',
        mapPath: '/blockonomics_payment',
    }
} as GatewayRoutes;