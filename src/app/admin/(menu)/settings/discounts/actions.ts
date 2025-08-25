'use server';
/** 
 * https://github.com/atmulyana/nextCart
 **/
import lang from '@/data/lang/server';
import {addDiscount, deleteDiscount, updateDiscount} from '@/data/discount';
import type {TDiscount} from '@/data/types';
import {redirectWithMessage} from '@/lib/auth';
import {isPlainObject} from '@/lib/common';
import {createFormAction} from "@/lib/routeHandler";

export const save = createFormAction(async (formData, redirect) => {
    const initDate = new Date(0);
    const id = formData.getString('id');
    const discount: TDiscount = {
        code: formData.getString('code'),
        type: formData.getString('type') as any,
        value: formData.getNumber('value'),
        start: formData.getDate('start') ?? initDate,
        end: formData.getDate('end') ?? initDate,
    };
    
    if (id) {
        await updateDiscount(id, discount);
    }
    else {
        await addDiscount(discount);
    }

    await redirect(
        '/admin/settings/discounts',
        {
            message: lang('Discount was saved successfully'),
            messageType: 'success',
        }
    );
});

export const remove = createFormAction(async (formData) => {
    const id = formData.getString('id');
    await deleteDiscount(id);
    return {
        message: lang('Discount was deleted successfully'),
        messageType: 'success',
    };
});
export async function erase(id: string) {
    const formData = new FormData();
    formData.set('id', id);
    const resp = await remove(formData);
    if (isPlainObject(resp) && resp.messageType == 'success') {
        await redirectWithMessage('/admin/settings/discounts', {message: resp.message, type: resp.messageType, counter: 2});
    }
    return resp;
}