/** 
 * https://github.com/atmulyana/nextCart
 **/
import {email, required} from '@react-input-validator/rules';
import {Schema} from '..';

export default new Schema({
    email: [required, email],
});