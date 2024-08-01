/** 
 * https://github.com/atmulyana/nextCart
 **/
import z from './';
import lang from '@/data/lang';
import {productExists} from '@/data/product';
import {stripHtml} from 'string-strip-html';
const {regex: badwordsList} = require('badwords-list') as {regex: RegExp};

export default z.form({
    title: z.preprocess(
        val => {
            if (typeof(val) == 'string') {
                return stripHtml(val).result
            }
            return val;
        },
        z.string()
            .refine(
                val => val.length <= 50,
                {
                    message: lang('Review title is too long'),
                }
            )
            .refine(
                val => !badwordsList.test(val),
                {
                    message: lang('Review was declined. Bad word found in your comment.'),
                }
            )
    ),
    description: z.preprocess(
        val => {
            if (typeof(val) == 'string') {
                return stripHtml(val).result
            }
            return val;
        },
        z.string()
            .refine(
                val => val.length <= 200,
                {
                    message: lang('Review description is too long'),
                }
            )
            .refine(
                val => !badwordsList.test(val),
                {
                    message: lang('Review was declined. Bad word found in your comment.'),
                }
            )
    ),
    rating: z.number().chain(num => num.min(1).max(5)),
    product: z.string().chain(str => str.optional()).refine(
        async (id) => id && (await productExists(id)),
        {
            message: lang('Product is not found'),
        } 
    ),
});