/** 
 * https://github.com/atmulyana/nextCart
 **/
import lang from '@/data/lang';
import {phoneRegex} from '../common';
import z from '.';

export default z.form({
    email: z.string().chain(str => str.email()),
    company: z.string().chain(str => str.optional()),
    firstName: z.string(),
    lastName: z.string(),
    address1: z.string(),
    address2: z.string().chain(str => str.optional()),
    country: z.string(),
    state: z.string(),
    postcode: z.string(),
    phone: z.string().chain(str => str.regex(phoneRegex, lang('Invalid phone number'))),
});