'use server';
/** 
 * https://github.com/atmulyana/nextCart
 **/
import bcrypt from "bcryptjs";
import {emptyString} from 'javascript-common';
import {deleteCustomer, updateCustomer} from "@/data/customer";
import lang from '@/data/lang/server';
import {TCustomer, WithoutId} from "@/data/types";
import {createFormAction} from "@/lib/routeHandler";

export const save = createFormAction(async (formData: FormData, redirect) => {
    const id = formData.getString('id');
    const password = formData.getString('password', false);
    const custObj: WithoutId<TCustomer> = {
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
        password: emptyString,
    };
    if (password) custObj.password = bcrypt.hashSync(password, 10);
    await updateCustomer(id, custObj);
    return redirect(
        '/admin/customers',
        {
            message: lang('Customer data was updated'),
            messageType: 'success',
        }
    )
});

export const remove = createFormAction(async (formData: FormData, redirect) => {
    const id = formData.getString('id');
    const redirectUrl = formData.getString('redirectUrl');
    await deleteCustomer(id);

    const reponseMessage = {
        message: lang('Customer successfully deleted'),
        messageType: 'success' as any,
    };

    if (redirectUrl) {
        await redirect(redirectUrl, reponseMessage);
    }
    else {
        return reponseMessage;
    }
});