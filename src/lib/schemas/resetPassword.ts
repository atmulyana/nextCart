/** 
 * https://github.com/atmulyana/nextCart
 **/
import z from '.';
import lang from '@/data/lang';

export default z.form({
    password: z.string().chain(str => str.min(4)),
    frm_user_password_confirm: z.if(
        data => data.password == data.frm_user_password_confirm,
        z.string().chain(str => str.min(4)),
        z.string().chain(str => str.min(4)).refine(() => false, lang('Password and Password Confirm must be the same')),
    ),
});