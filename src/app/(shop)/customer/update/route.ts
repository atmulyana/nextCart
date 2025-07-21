/** 
 * https://github.com/atmulyana/nextCart
 **/
import type {TCustomer, TSessionCustomer} from '@/data/types';
import {
    dbTrans,
    // ObjectId,
    // toId
} from '@/data/db-conn';
import {
    // getCustomerByEmail,
    updateCustomer
} from '@/data/customer';
import lang from '@/data/lang/server';
import {getSession, setCustomerSession} from '@/data/session';
import {updateSessionToken} from '@/lib/auth'; 
import {ResponseMessage} from '@/lib/common';
import {createPostHandler} from '@/lib/routeHandler';

export const POST = createPostHandler(async (formData) => {
    return await dbTrans(async () => {
        // let customerId: ObjectId | undefined;
        // if (formData.has('customerId')) {
        //     customerId = toId(formData.getString('customerId'))
        // }
        // else {
        //     const customer = await getCustomerByEmail(formData.getString('email'));
        //     customerId = customer?._id;
        // }
        const {customerId} = await getSession();
        if (!customerId) return ResponseMessage(lang('Customer data not found'), 404);
        
        const custObj: Omit<TCustomer, '_id' | 'password'> = {
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
        };
        const sessObj: Omit<TSessionCustomer, '_id'> = {
            customerId,
            customerEmail: custObj.email,
            customerCompany: custObj.company,
            customerFirstname: custObj.firstName,
            customerLastname: custObj.lastName,
            customerAddress1: custObj.address1,
            customerAddress2: custObj.address2,
            customerCountry: custObj.country,
            customerState: custObj.state,
            customerPostcode: custObj.postcode,
            customerPhone: custObj.phone,
        };
        
        await updateCustomer(customerId, custObj);
        await setCustomerSession(sessObj);
        await updateSessionToken({
            customer: {
                email: custObj.email,
            }
        });

        return ResponseMessage(lang('Customer data was updated'), 200);
    });
});