/** 
 * https://github.com/atmulyana/nextCart
 **/
import {length, required, rule} from '@react-input-validator/rules';
import lang from '@/data/lang';
import {Schema} from '..';
import messages from '../messages';

export default new Schema({
    password: [required, length(4)],
    frm_user_password_confirm: [
        required,
        rule(
            (val, {inputValues}) => val === inputValues?.password,
            lang(messages.confirmPassword)
        )
    ],
});