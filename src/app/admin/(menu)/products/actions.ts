'use server';
/** 
 * https://github.com/atmulyana/nextCart
 **/
import lang from '@/data/lang';
import {dbTrans} from '@/data/db-conn';
import {deleteProduct, setProductPublished} from '@/data/product';
import {createFormAction} from "@/lib/routeHandler";

export const updatePublished = createFormAction(async (formData: FormData) => {
    const id = formData.getString('id');
    const published = formData.has('published');
    await setProductPublished(id, published);
    return {
        message: lang('Published state updated'),
        messageType: 'success',
    }
});

export const remove = createFormAction(async (formData: FormData) => {
    const id = formData.getString('id');
    return await dbTrans(async () => {
        const stat = await deleteProduct(id);
        if (stat === 0) {
            return {
                message: lang("There was an order for this product. It can be only set to 'unpublished' status."),
                messageType: 'warning',
            };
        }
        return {
            message: lang('Product successfully removed'),
            messageType: 'success',
        };
    });
});