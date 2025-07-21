/** 
 * https://github.com/atmulyana/nextCart
 **/
import {regexp as badwords} from 'badwords-list';
import {max, min, numeric, required, rule} from '@react-input-validator/rules';
import {stripHtml} from 'string-strip-html';
import lang from '@/data/lang';
import {str} from '@/lib/common';
import {Schema} from '..';
import messages from '../messages';

const goodWords = (name: string, maxLength: number) => rule(
    (val, param) => {
        const strVal = stripHtml(val+'').result;
        if (strVal.length > maxLength) return false;
        badwords.lastIndex = 0;
        if (badwords.test(strVal)) return lang(messages.badWords);
        param.resultValue = strVal;
        return true;
    },
    str(lang(messages.longReview), {name: lang(name)})
);

export default new Schema({
    title: [required, goodWords('title', 50)],
    description: [required, goodWords('description', 200)],
    rating: [required, numeric, min(1), max(5)],
});