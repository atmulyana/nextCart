/** 
 * https://github.com/atmulyana/nextCart
 **/
import {required} from '@react-input-validator/rules';
import {Schema} from '..';

export default new Schema({
    discountCode: required,
});