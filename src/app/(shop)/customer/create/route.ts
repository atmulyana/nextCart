/** 
 * https://github.com/atmulyana/nextCart
 **/
const bcrypt = require('bcryptjs');
import type {TCustomer, TSessionCustomer, WithoutId} from '@/data/types';
import {dbTrans} from '@/data/db-conn';
import {updateOrderComment} from '@/data/cart';
import {createCustomer, getCustomerByEmail} from '@/data/customer';
import lang from '@/data/lang';
import {setCustomerSession} from '@/data/session';
import {updateSessionToken} from '@/lib/auth'; 
import {ResponseMessage} from '@/lib/common';
import {createPostHandler} from '@/lib/routeHandler';

export const POST = createPostHandler(async (formData, redirect, isFromMobile) => {
    return await dbTrans(async () => {
        const email = formData.getString('email');
        const existingCustomer = await getCustomerByEmail(email);
        if (existingCustomer) return ResponseMessage(lang('A customer already exists with that email address'), 400);
        
        const customer: WithoutId<TCustomer> = {
            email,
            company: formData.getString('company'),
            firstName: formData.getString('firstName'),
            lastName: formData.getString('lastName'),
            address1: formData.getString('address1'),
            address2: formData.getString('address2'),
            country: formData.getString('country'),
            state: formData.getString('state'),
            postcode: formData.getString('postcode'),
            phone: formData.getString('phone'),
            password: bcrypt.hashSync(formData.getString('password', false), 10),
        }
        const sessObj: WithoutId<TSessionCustomer> = {
            customerEmail: customer.email,
            customerCompany: customer.company,
            customerFirstname: customer.firstName,
            customerLastname: customer.lastName,
            customerAddress1: customer.address1,
            customerAddress2: customer.address2,
            customerCountry: customer.country,
            customerState: customer.state,
            customerPostcode: customer.postcode,
            customerPhone: customer.phone,
        };

        sessObj.customerId = await createCustomer(customer);
        await setCustomerSession(sessObj.customerId)
        await updateOrderComment(formData.getString('orderComment'));
        await updateSessionToken({
            customer: {
                id: sessObj.customerId.toString('base64'),
                email: sessObj.customerEmail,
            }
        });

        if (isFromMobile) {
            const {password, ...custObj} = customer;
            return Response.json(custObj);
        }
        redirect('/checkout/shipping');
    });
});