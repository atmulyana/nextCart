/** 
 * https://github.com/atmulyana/nextCart
 **/
import {
    alwaysValid,
    boolean,
    email,
    length,
    required,
    rule,
} from '@react-input-validator/rules';
import lang from '@/data/lang';
import {Schema} from '..';
import messages from '../messages';

export default new Schema({
    id: alwaysValid,
    name: required,
    email: [
        required,
        email
    ],
    password: [
        required.if(
            (_, {inputValues}) => typeof(inputValues?.id) != 'string' || !inputValues.id.trim() //new user
        ),
        length(4)
    ],
    passwordConfirm: [
        required.if(
            (_, {inputValues}) => !!inputValues?.password?.trim() //if password is not empty
        ),
        rule(
            (value, {inputValues}) => value == inputValues?.password,
            lang(messages.confirmPassword)
        ),
    ],
    isAdmin: boolean,
});