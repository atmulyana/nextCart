/** 
 * https://github.com/atmulyana/nextCart
 **/
import {required, ruleAsync} from '@react-input-validator/rules';
import lang from '@/data/lang';
import {productExists} from '@/data/product';
import review from '../all/review';
import {Schema} from '..';
import messages from '../messages';

export default new Schema({
    ...review.shape,
    product: [
        required,
        ruleAsync(
            async (id, resolve) => {
                resolve(await productExists(id as string));
            },
            lang(messages.missingProduct)
        )
    ],
});