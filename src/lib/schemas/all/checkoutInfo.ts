/** 
 * https://github.com/atmulyana/nextCart
 **/
import {alwaysValid, boolean, length, required} from '@react-input-validator/rules';
import customerData from './customerData';
import {Schema} from '..';

export default new Schema({
    ...customerData.shape,
    orderComment: alwaysValid,
    createAccount: boolean,
    password: [required.if((_, {inputValues}) => inputValues?.createAccount), length(4)],
});