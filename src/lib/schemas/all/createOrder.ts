/** 
 * https://github.com/atmulyana/nextCart
 **/
import {alwaysValid, rule} from '@react-input-validator/rules';
import {OrderStatusMap} from '@/data/types';
import customerData from './customerData';
import {Schema} from '..';

export default new Schema({
    ...customerData.shape,
    orderStatus: rule<string>(
        value => (OrderStatusMap as {[p: string]: boolean})[value],
    ),
    orderComment: alwaysValid,
});