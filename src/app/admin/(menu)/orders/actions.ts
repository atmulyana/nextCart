'use server';
/** 
 * https://github.com/atmulyana/nextCart
 **/
import {ObjectId} from 'mongodb';
import {toId} from '@/data/db-conn';
import lang from '@/data/lang/server';
import {getCustomerByEmail} from '@/data/customer';
import {getCart} from '@/data/cart';
import {deleteOrder, updateOrderStatus} from "@/data/order";
import {createFormAction} from "@/lib/routeHandler";
import type {OrderStatus, TSessionCustomer, WithoutId} from '@/data/types';
import {createOrder} from '@/lib/payments';

export const create = createFormAction(async (formData, redirect) => {
    const cart = await getCart();
    if (!cart || Object.keys(cart.items).length < 1) return {
        message: lang('The cart is empty. You will need to add items to the cart first.'),
    };

    cart.orderComment = formData.getString('orderComment');
    if (!cart.orderComment) delete cart.orderComment;

    const session: WithoutId<TSessionCustomer> = {};
    session.customerId = toId(formData.getString('customerId'));
    if (!session.customerId) delete session.customerId;
    session.customerEmail = formData.getString('email');
    session.customerCompany = formData.getString('company');
    if (!session.customerCompany) delete session.customerCompany;
    session.customerFirstname = formData.getString('firstName');
    session.customerLastname = formData.getString('lastName');
    session.customerAddress1 = formData.getString('address1');
    session.customerAddress2 = formData.getString('address2');
    if (!session.customerAddress2) delete session.customerAddress2;
    session.customerCountry = formData.getString('country');
    session.customerState = formData.getString('state');
    session.customerPostcode = formData.getString('postcode');
    session.customerPhone = formData.getString('phone');

    const message = lang('Your order was successfully placed. Payment for your order will be completed instore.');
    const orderId = await createOrder(
        {
            orderPaymentId: new ObjectId().toString(),
            orderPaymentGateway: 'Instore',
            orderStatus: formData.getString('status') as OrderStatus,
            orderPaymentMessage: lang('Your payment was successfully completed'),
            orderComment: formData.getString('orderComment'),
        },
        true,
        message,
        session
    );

    await redirect(
        `/admin/orders/view/${orderId}`,
        {
            message: lang('Order was created successfully'),
            messageType: 'success',
        }
    );
});

export const updateStatus = createFormAction(async (formData: FormData) => {
    const id = formData.getString('id'),
          status = formData.getString('status');
    await updateOrderStatus(id, status as any);
    return {
        message: lang('Status successfully updated'),
        messageType: 'success',
    };
});

export const remove = createFormAction(async (formData: FormData, redirect) => {
    const id = formData.getString('id');
    const redirectUrl = formData.getString('redirectUrl');
    await deleteOrder(id);

    const responseMessage = {
        message: lang('Order successfully deleted'),
        messageType: 'success' as any,
    };

    if (redirectUrl) {
        await redirect(redirectUrl, responseMessage);
    }
    else {
        return responseMessage;
    }
});

export const findCustomer = createFormAction(async (formData: FormData) => {
    const email = formData.getString('email');
    const customer = await getCustomerByEmail(email);

    if (customer) {
        customer._id = customer._id.toString();
        return {
            messageType: 'success',
            data: customer,
        }
    }
    else {
        return {
            message: lang('Customer not found'),
            messageType: 'danger',
            data: null,
        }
    }
});
export async function getCustomer(customerEmail: string) {
    const formData = new FormData();
    formData.set('email', customerEmail);
    return await findCustomer(formData);
}