/** 
 * https://github.com/atmulyana/nextCart
 **/
import type {TCustomer, TSessionCustomer} from '@/data/types';
import {
    dbTrans,
    // ObjectId,
    toId
} from '@/data/db-conn';
//import {getCustomerByEmail} from '@/data/customer';
import {getSession, setCustomerSession} from '@/data/session';
import {updateOrderComment} from '@/data/cart';
import {updateSessionToken} from '@/lib/auth'; 
import {createPostHandler} from '@/lib/routeHandler';

export const POST = createPostHandler(async (formData, redirect, isFromMobile) => {
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
        const customerId2 = toId(formData.getString('customerId'));
        if ( (!customerId && !customerId2 || customerId?.equals(customerId2)) != true ) {
            return redirect('/', {message: 'Logout'});
        }
        
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
        if (customerId) sessObj.customerId = customerId;
        
        await setCustomerSession(sessObj);
        await updateOrderComment(formData.getString('orderComment'));
        await updateSessionToken({
            customer: {
                email: custObj.email,
            }
        });

        if (isFromMobile) return Response.json(custObj);
        redirect('/checkout/shipping');
    });
});