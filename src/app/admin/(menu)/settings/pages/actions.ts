'use server';
/** 
 * https://github.com/atmulyana/nextCart
 **/
import lang from '@/data/lang/server';
import {addPage, deletePage, updatePage} from '@/data/page';
import {TPage, WithoutId} from '@/data/types';
import {redirectWithMessage} from '@/lib/auth';
import {isPlainObject} from '@/lib/common';
import {createFormAction} from "@/lib/routeHandler";

export const save = createFormAction(async (formData, redirect) => {
    const id = formData.getString('id');
    const page: WithoutId<TPage> = {
        name: formData.getString('name'),
        slug: formData.getString('slug'),
        enabled: formData.getBoolean('enabled', true),
        content: formData.getString('content'),
    };
    
    if (id) {
        await updatePage(id, page);
    }
    else {
        await addPage(page);
    }

    await redirect(
        '/admin/settings/pages',
        {
            message: lang('Static page was saved successfully'),
            messageType: 'success',
        }
    );
});

export const remove = createFormAction(async (formData) => {
    const id = formData.getString('id');
    await deletePage(id);
    return {
        message: lang('Static page was deleted successfully'),
        messageType: 'success',
    };
});
export async function erase(id: string) {
    const formData = new FormData();
    formData.set('id', id);
    const resp = await remove(formData);
    if (isPlainObject(resp) && resp.messageType == 'success') {
        await redirectWithMessage('/admin/settings/pages', {message: resp.message, type: resp.messageType, counter: 2});
    }
    return resp;
}