/** 
 * https://github.com/atmulyana/nextCart
 **/
import {ruleAsync} from '@react-input-validator/rules';
import lang from '@/data/lang';
import {permalinkExists} from '@/data/product';
import newProduct from '../all/product';
import {type RuleArray, Schema} from '..';
import messages from '../messages';

export default new Schema({
    ...newProduct.shape,
    permalink: [
        ...(newProduct.shape.permalink as RuleArray),
        ruleAsync(
            (permalink, resolve, {inputValues}) => {
                permalinkExists(permalink, inputValues?.id).then(
                    exists => resolve(!exists)
                );
            },
            lang(messages.permalinkExists)
        )
    ],
});