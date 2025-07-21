/** 
 * https://github.com/atmulyana/nextCart
 **/
import {alwaysValid, email, regex, required} from '@react-input-validator/rules';
import lang from '@/data/lang';
import {/*nameRegex, postalCodeRegex,*/ phoneRegex} from '../../common';
import {Schema} from '..';
import messages from '../messages';

export default new Schema({
    email: [required, email],
    company: alwaysValid,
    firstName: [required, /* regex(nameRegex) */],
    lastName: [required, /* regex(nameRegex) */],
    address1: required,
    address2: alwaysValid,
    country: required,
    state: required,
    postcode: [required, /* regex(postalCodeRegex) */],
    phone: [required, regex(phoneRegex).setErrorMessage(lang(messages.phone))],
});