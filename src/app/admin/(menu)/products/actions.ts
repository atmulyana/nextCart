'use server';
/** 
 * https://github.com/atmulyana/nextCart
 **/
import lang from '@/data/lang/server';
import {dbTrans} from '@/data/db-conn';
import type {_Id, TProduct, WithoutId} from '@/data/types';
import {addProduct, deleteProduct, setProductPublished} from '@/data/product';
import {redirectWithMessage} from '@/lib/auth';
import {createFormAction} from "@/lib/routeHandler";
import {validateForm} from '@/lib/schemas';

export const save = createFormAction(async (formData: FormData) => {
    return await dbTrans(async () => {
        const product: WithoutId<TProduct> = {
            productPermalink: formData.getString('permalink'),
            productTitle: formData.getString('title'),
            productPrice: formData.getNumber('price'),
            productDescription: formData.getString('description'),
            productGtin: formData.getString('gtin'),
            productBrand: formData.getString('brand'),
            productPublished: formData.getBoolean('published'),
            tags: formData.getAll('tags') as string[],
            productComment: formData.getBoolean('allowComment', true),
        };
        const stock = formData.getNumber('stock'),
              stockDisable = formData.getBoolean('stockDisable', true);
        if (!isNaN(stock)) product.productStock = stock;
        if (stockDisable !== null) product.productStockDisable = stockDisable;
        const productId = await addProduct(product);

        return redirectWithMessage(
            `/admin/products/form/${productId.toString()}`,
            {
                message: lang('New product was successfully created'),
                type: 'success',
            }
        );
    });
});

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

export async function validatePermalink(permalink: string, excludedProductId?: _Id) {
    const formData = new FormData();
    formData.set('permalink', permalink);
    if (excludedProductId) formData.set('id', excludedProductId.toString());
    const {success, message} = await validateForm('newProduct', formData, 'permalink');
    return {
        success,
        message: success ? lang('Permalink is available') : message,
    }
}