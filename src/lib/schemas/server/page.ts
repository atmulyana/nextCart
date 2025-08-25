/** 
 * https://github.com/atmulyana/nextCart
 **/
import {ruleAsync} from '@react-input-validator/rules';
import lang from '@/data/lang';
import {pageSlugAvailable} from '@/data/page';
import pageSchema from '../all/page';
import {type RuleArray, Schema} from '..';
import messages from '../messages';

export default new Schema({
    ...pageSchema.shape,
    slug: [
        ...(pageSchema.shape.slug as RuleArray),
        ruleAsync(
            (slug, resolve, {inputValues}) => {
                pageSlugAvailable(slug, inputValues?.id).then(
                    available => resolve(available)
                );
            },
            lang(messages.pageSlugExists)
        )
    ],
});