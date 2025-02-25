'use server';
/** 
 * https://github.com/atmulyana/nextCart
 **/
import lang from '@/data/lang';
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

export const remove = createFormAction(async (formData: FormData) => {
    const id = formData.getString('id');
    await deleteOrder(id);
    return {
        message: lang('Order successfully deleted'),
        messageType: 'success',
    };
});