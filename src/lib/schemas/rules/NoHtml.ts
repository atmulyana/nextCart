/** 
 * https://github.com/atmulyana/nextCart
 **/
import {ValidationRule} from '@react-input-validator/rules';
import {stripHtml} from 'string-strip-html';
import messages from '../messages';

export default class NoHtml extends ValidationRule<string> {
    get errorMessage() {
        return this.lang(messages.sanitizeHtml);
    }
    validate() {
        const res = stripHtml(this.value);
        this.isValid = res.allTagLocations.length < 1; 
        return this;
    }
}