'use server';
/** 
 * https://github.com/atmulyana/nextCart
 **/
import lang from '@/data/lang/server';
import {dbTrans} from '@/data/db-conn';
import {addMenu, deleteMenu, getMenu, sortMenu, updateMenu, updateMenuOrder} from '@/data/menu';
import {TMenu} from '@/data/types';
import {createFormAction} from "@/lib/routeHandler";

export const save = createFormAction(async (formData) => {
    const menu: Omit<TMenu, 'order'> = {
        _id: formData.getNumber('id'),
        title: formData.getString('title'),
        link: formData.getString('link'),
    };
    const url = new URL(menu.link, 'http://localhost');
    if (url.protocol == 'http:' && url.host == 'localhost') menu.link = url.pathname + url.search + url.hash;
    else menu.link = url.href;
    
    const response = await dbTrans(async () => {
        if (isNaN(menu._id)) {
            await addMenu(menu);
            return {
                message: lang('Menu was created successfully'),
                messageType: 'success',
            }
        }
        else {
            await updateMenu(menu);
            return {
                message: lang('Menu was updated successfully'),
                messageType: 'success',
            }
        }
    });

    return {
        ...response,
        menu: sortMenu(await getMenu()),
    };
});

export const updateOrder = createFormAction(async (formData) => {
    const ids: number[] = [];
    formData.getAll('id').forEach(id => {
        if (typeof(id) == 'string') ids.push(parseInt(id));
    });

    await dbTrans(async () => {
        await updateMenuOrder(ids);
    });

    return {
        message: lang('Menu order was updated successfully'),
        messageType: 'success',
        menu: sortMenu(await getMenu()),
    };
});

export const remove = createFormAction(async (formData) => {
    const id = formData.getNumber('id');
    await deleteMenu(id);
    return {
        message: lang('Menu was deleted successfully'),
        messageType: 'success',
        menu: sortMenu(await getMenu()),
    };
});