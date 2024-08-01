/** 
 * https://github.com/atmulyana/nextCart
 **/
const bcrypt = require('bcryptjs');
import type {TCustomer, TSessionCustomer} from '@/data/types';
import {dbTrans} from '@/data/db-conn';
import {createCustomer} from '@/data/customer';
import {setCustomerSession} from '@/data/session';
import {updateOrderComment} from '@/data/cart';
import {createPostHandler} from '@/lib/routeHandler';
import {updateSessionToken} from '@/lib/auth'; 

export const POST = createPostHandler(async (formData, redirect, isFromMobile) => {
    return await dbTrans(async () => {
        const customer: Omit<TCustomer, '_id'> = {
            email: formData.getString('email'),
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
        const sessObj: Omit<TSessionCustomer, '_id'> = {
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