'use server';
/** 
 * https://github.com/atmulyana/nextCart
 **/
// const {regex: badwordsList} = require('badwords-list') as {regex: RegExp};
// import {stripHtml} from 'string-strip-html';
import {toId, type ObjectId} from '@/data/db-conn';
import lang from '@/data/lang';
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

    // if (!title) return ResponseMessage(lang('Please supply a review title'), 400);
    // if (!description) return ResponseMessage(lang('Please supply a review description'), 400);
    // if (isNaN(rating) || rating < 1 || rating > 5) return ResponseMessage(lang('Please supply a valid rating (numeric 1 to 5)'), 400);
    // title = stripHtml(title).result;
    // if (title.length > 50) return ResponseMessage(lang('Review title is too long'), 400);
    // description = stripHtml(description).result;
    // if (description.length > 200) return ResponseMessage(lang('Review description is too long'), 400);

    // if (badwordsList.test(review.title) || badwordsList.test(review.description)) {
    //     return ResponseMessage(lang('Review was declined. Bad word found in your comment.'), 400);
    // }

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