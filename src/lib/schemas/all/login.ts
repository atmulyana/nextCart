/** 
 * https://github.com/atmulyana/nextCart
 **/
import {alwaysValid, email, required} from '@react-input-validator/rules';
import {Schema} from '..';

export default new Schema({
    loginEmail: [required, email],
    loginPassword: required,
    referrerUrl: alwaysValid,
});