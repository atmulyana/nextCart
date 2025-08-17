/** 
 * https://github.com/atmulyana/nextCart
 **/
import {ValidationRule} from '@react-input-validator/rules';
import sanitize from 'sanitize-html';
import messages from '../messages';

export default class HtmlSanitized extends ValidationRule<string> {
    #resultValue: any;
    get resultValue() {
        return this.#resultValue ?? super.resultValue;
    }
    get errorMessage() {
        return this.lang(messages.sanitizeHtml);
    }
    validate() {
        this.isValid = true;
        const validTags = sanitize.defaults.allowedTags;
        this.#resultValue = sanitize(this.value, {
            onOpenTag: (name) => {
                if (!validTags.includes(name)) this.isValid = false;
            },
        });
        return this;
    }
}