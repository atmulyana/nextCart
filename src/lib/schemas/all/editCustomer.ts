/** 
 * https://github.com/atmulyana/nextCart
 **/
import {length} from '@react-input-validator/rules';
import customerData from './customerData';
import {Schema} from '..';

export default new Schema({
    ...customerData.shape,
    password: length(4),
});