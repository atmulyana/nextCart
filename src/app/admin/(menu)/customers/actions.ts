'use server';
/** 
 * https://github.com/atmulyana/nextCart
 **/
import {deleteCustomer} from "@/data/customer";
import lang from '@/data/lang/server';
import {createFormAction} from "@/lib/routeHandler";

export const remove = createFormAction(async (formData: FormData, redirect) => {
    const id = formData.getString('id');
    const redirectUrl = formData.has('redirectUrl');
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