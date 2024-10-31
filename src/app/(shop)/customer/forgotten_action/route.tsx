/** 
 * https://github.com/atmulyana/nextCart
 **/
import {nanoid} from 'nanoid';
import {ResponseMessage} from '@/lib/common';
import {createPostHandler} from '@/lib/routeHandler';
import lang from '@/data/lang';
import {getCustomerByEmail, updateCustomer} from '@/data/customer';
import {sendEmail} from '@/lib/email';
import EmailTemplate from '@/lib/email/templates/ForgottenPassword';

export const POST = createPostHandler(async (formData) => {
    try {
        const email = formData.getString('email');
        
        const customer = email && await getCustomerByEmail(email);
        if (!customer) {
            return ResponseMessage(lang('If your account exists, a password reset has been sent to your email'), 200);
        }

        const resetToken = nanoid(30);
        const resetTokenExpiry = Date.now() + 3600000; //an hour
        await updateCustomer(customer._id, {resetToken, resetTokenExpiry});
        await sendEmail(
            customer.email,
            lang('Resetting password request'),
            <EmailTemplate token={resetToken} />
        );

        return ResponseMessage(lang('If your account exists, a password reset has been sent to your email'), 200);
    }
    catch {
        return ResponseMessage(lang('Password reset failed'));
    }
});