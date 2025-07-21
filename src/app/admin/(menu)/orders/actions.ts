'use server';
/** 
 * https://github.com/atmulyana/nextCart
 **/
import lang from '@/data/lang/server';
import {deleteOrder, updateOrderStatus} from "@/data/order";
import {createFormAction} from "@/lib/routeHandler";

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