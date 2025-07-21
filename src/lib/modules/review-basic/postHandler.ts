'use server';
/** 
 * https://github.com/atmulyana/nextCart
 **/
import {toId, type ObjectId} from '@/data/db-conn';
import lang from '@/data/lang/server';
import {getSession} from '@/data/session';
import {ResponseMessage} from '@/lib/common';
import {createReview, deleteReview} from './data';

export async function addReview(formData: FormData) {
    const session = await getSession();
    if (!session.customerPresent) {
        return ResponseMessage(lang('You need to be logged in to create a review'), 401);
    }

    let title = formData.getString('title');
    let description = formData.getString('description');
    let rating = formData.getNumber('rating');
    let product = formData.getString('product');

    const ret = await createReview({
        title,
        description,
        rating: Math.floor(rating),
        customer: session.customerId || (((session.customerFirstname || '') + ' ' + (session.customerLastname || '')).trim() || void(0)),
        product: toId(product) as ObjectId,
    });
    if (ret === true) {
        return ResponseMessage(lang('Review successfully submitted'), {status: 200, messageType: 'success'});
    }
    else if (typeof(ret) == 'object' && typeof(ret.message) == 'string' && ret.message.trim()) {
        return ResponseMessage(lang(ret.message), 400);
    }
    else {
        return ResponseMessage(lang('Unable to submit review'));
    }
}

export async function removeReview(formData: FormData) {
    await deleteReview( formData.getString('id') );
    return {
        message: lang('Review successfully deleted'),
        messageType: 'success',
    }
}