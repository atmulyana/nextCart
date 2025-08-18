'use server';
/** 
 * https://github.com/atmulyana/nextCart
 **/
import lang from '@/data/lang/server';
import {dbTrans} from '@/data/db-conn';
import type {_Id, TProductInsert, TVariant, WithoutId} from '@/data/types';
import {
    addImage,
    addProduct,
    addVariant,
    deleteImage,
    deleteProduct,
    deleteVariant,
    getVariants,
    setMainImage as dbSetMainImage,
    setProductPublished,
    updateProduct,
    updateVariant,
} from '@/data/product';
import {createFormAction} from "@/lib/routeHandler";
import {validateForm} from '@/lib/schemas';

export const save = createFormAction(async (formData, redirect) => {
    return await dbTrans(async () => {
        const id = formData.getString('id');
        const product: WithoutId<TProductInsert> = {
            productPermalink: formData.getString('permalink'),
            productTitle: formData.getString('title'),
            productPrice: formData.getNumber('price'),
            productDescription: formData.getString('description'),
            productGtin: formData.getString('gtin'),
            productBrand: formData.getString('brand'),
            productPublished: formData.getBoolean('published'),
            productComment: formData.getBoolean('allowComment', true),
        };
        const tags = formData.getAll('tags') as string[];
        if (tags.length > 0) product.tags = tags;
        const stock = formData.getNumber('stock'),
            stockDisable = formData.getBoolean('stockDisable', true),
            subscription = formData.getString('subscription');
        if (subscription) product.productSubscription = subscription
        if (!isNaN(stock)) product.productStock = stock;
        if (stockDisable !== null) product.productStockDisable = stockDisable;
        
        if (id) {
            const updatedProduct: TProductInsert = {...product, _id: id};
            await updateProduct(updatedProduct);
            return redirect(
                '/admin/products',
                {
                    message: lang('Product successfully saved'),
                    messageType: 'success',
                }
            );
        }
        else {
            const productId = await addProduct(product);
            return redirect(
                `/admin/products/form/${productId.toString()}`,
                {
                    message: lang('New product was successfully created'),
                    messageType: 'success',
                }
            );
        }
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
    const {success, message} = await validateForm('product', formData, 'permalink');
    return {
        success,
        message: success ? lang('Permalink is available') : message,
    }
}

export const uploadImage = createFormAction(async (formData: FormData) => {
    const id = formData.getString('productId');
    const image = formData.getFile('image') as File;
    return await dbTrans(async () => {
        const ret = await addImage(id, image);
        if (ret) {
            return {
                message: lang("File uploaded successfully"),
                messageType: 'success',
            };
        }
        throw 'Error uploading product image';
    });
});

export const delImage = createFormAction(async (formData: FormData) => {
    const id = formData.getString('productId');
    const idx = formData.getNumber('imageIdx');
    return await dbTrans(async () => {
        const ret = await deleteImage(id, idx);
        if (ret) return {
            message: lang("Image successfully deleted"),
            messageType: 'success',
        };
        throw 'Error deleting product image';
    });
});
export async function removeImage(productId: string, imageIdx: number) {
    const data = new FormData();
    data.set('productId', productId);
    data.set('imageIdx', imageIdx.toString());
    return await delImage(data);
}

export const changeMainImage = createFormAction(async (formData: FormData) => {
    const id = formData.getString('productId');
    const idx = formData.getNumber('imageIdx');
    return await dbTrans(async () => {
        const ret = await dbSetMainImage(id, idx);
        if (ret) return {
            message: lang("Main image successfully set"),
            messageType: 'success',
        };
        throw 'Error setting main product image';
    });
});
export async function setMainImage(productId: string, imageIdx: number) {
    const data = new FormData();
    data.set('productId', productId);
    data.set('imageIdx', imageIdx.toString());
    return await changeMainImage(data);
}

export const saveVariant = createFormAction(async (formData: FormData) => {
    const id = formData.getString('id');
    const variant: WithoutId<TVariant> & {_id?: _Id} = {
        title: formData.getString('title'),
        price: formData.getNumber('price'),
        product: formData.getString('product'),
    };
    const stock = formData.getNumber('stock');
    if (Number.isInteger(stock)) variant.stock = stock;
    const imageIdx = formData.getNumber('imageIdx');
    if (Number.isInteger(imageIdx)) variant.imageIdx = imageIdx;

    if (id) {
        variant._id = id;
        await updateVariant(variant as TVariant);
    }
    else {
        await addVariant(variant);
    }

    const variants = await getVariants(variant.product as _Id);

    return {
        message: lang('Product variant was saved successfully'),
        messageType: 'success',
        variants,
    };
});

export const delVariant = createFormAction(async (formData: FormData) => {
    const id = formData.getString('id'),
          productId = formData.getString('product');
    const ret = await deleteVariant(id);
    const variants = await getVariants(productId);
    if (ret) return {
        message: lang("Product variant was deleted successfully"),
        messageType: 'success',
        variants,
    };
    throw 'Error deleting product variant';
});
export async function removeVariant(variantId: string, productId: string) {
    const data = new FormData();
    data.set('id', variantId);
    data.set('product', productId);
    return await delVariant(data);
}