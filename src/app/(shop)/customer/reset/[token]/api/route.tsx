/** 
 * https://github.com/atmulyana/nextCart
 **/
import React from 'react';
const bcrypt = require('bcryptjs');
import {ResponseMessage} from '@/lib/common';
import lang from '@/data/lang';
import {getCustomerByResetToken, updateCustomer} from '@/data/customer';
import {sendEmail} from '@/lib/email';
import EmailTemplate from '@/lib/email/templates/PasswordResetEmail';
import {createPostHandler} from '@/lib/routeHandler';

export const POST = createPostHandler(async function(formData, redirect) {
    const token = formData.getString('token');
    const password = formData.getString('password');

    const customer = token && await getCustomerByResetToken(token);
    if (!customer) {
        return ResponseMessage(lang('Password reset token is invalid or has expired'), 400);
    }
    
    try {
        const newPassword = bcrypt.hashSync(password, 10);
        await updateCustomer(
            customer._id,
            {password: newPassword},
            ['resetToken', 'resetTokenExpiry']
        );
    }
    catch {
        return ResponseMessage(lang('Unable to reset password'));
    }
    
    sendEmail(
        customer.email,
        lang('Password reset was successful'),
        <EmailTemplate email={customer.email} />
    );
    await redirect('/checkout/information', {
        message: lang('Password was successfully updated'),
        messageType: 'success',
    });
});