/** 
 * https://github.com/atmulyana/nextCart
 **/
import bcrypt from "bcryptjs";
import {ResponseMessage} from '@/lib/common';
import {signIn} from '@/lib/auth';
import {createPostHandler} from '@/lib/routeHandler';
import lang from '@/data/lang/server';
import {getCustomerByEmail} from '@/data/customer';
import {setCustomerSession} from '@/data/session';

export const POST = createPostHandler(async (formData, redirect, isFromMobile) => {
    const email = formData.getString('loginEmail');
    const password = formData.getString('loginPassword', false);
    
    const customer = email && await getCustomerByEmail(email);
    if (!customer) {
        return ResponseMessage(lang('A customer with that email does not exist.'), 400);
    }

    const cannotLogin = ResponseMessage(lang('Access denied. Check password and try again.'), 400);
    try {
        const isPwdValid: boolean = await bcrypt.compare(password, customer.password);
        if (!isPwdValid) return cannotLogin;
    }
    catch {
        return cannotLogin;
    }

    await signIn(
        'customer',
        {
            customerId: customer._id.toString('base64'),
            customerEmail: email,
            redirect: false,
        }
    );

    if (await setCustomerSession(customer._id)) {
        if (isFromMobile) return Response.json({
            message: lang('Successfully logged in'),
            messageType: 'success',
            customer
        });
        return redirect(formData.get('referrerUrl'), '/customer/account');
    }
    else {
        return cannotLogin;
    }
});