/** 
 * https://github.com/atmulyana/nextCart
 **/
import {ruleAsync} from '@react-input-validator/rules';
import lang from '@/data/lang';
import {getDiscountByCode} from '@/data/discount';
import discountSchema from '../all/discount';
import {type RuleArray, Schema} from '..';
import messages from '../messages';

export default new Schema({
    ...discountSchema.shape,
    code: [
        ...(discountSchema.shape.code as RuleArray),
        ruleAsync(
            (code, resolve, {inputValues}) => {
                getDiscountByCode(code, inputValues?.id).then(
                    disc => resolve(!disc)
                );
            },
            lang(messages.discountDuplicate)
        )
    ],
});