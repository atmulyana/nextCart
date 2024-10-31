/** 
 * https://github.com/atmulyana/nextCart
 **/
import z from '.';
import customerData from './customerData';
import lang from '@/data/lang';
import {getCustomerByEmail} from '@/data/customer';

export default customerData.extends({
    email: z.if(
        data => data.createAccount,
        z.string().chain(str => str.email()).refine(
            async (email) => (await getCustomerByEmail(email)) == null,
            {
                message: lang('A customer already exists with that email address'),
            } 
        ),
        z.string().chain(str => str.email()),
    ),
    orderComment: z.string().chain(str => str.optional()),
    createAccount: z.boolean(),
    password: z.if(
        data => data.createAccount,
        z.string().chain(str => str.min(4)),
        z.string().chain(str => str.optional()),
    ),
});