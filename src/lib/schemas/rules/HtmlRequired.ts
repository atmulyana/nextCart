/** 
 * https://github.com/atmulyana/nextCart
 **/
import {Required} from '@react-input-validator/rules';
import {stripHtml} from 'string-strip-html';

export default class HtmlRequired extends Required {
    #resultValue: any;
    get resultValue() {
        return this.#resultValue ?? super.resultValue;
    }
    validate() {
        this.#resultValue = null;
        if (typeof(this.value) == 'string') {
            this.#resultValue = this.value.trim();
            this.setValue(stripHtml(this.value).result);
        }
        return super.validate();
    }
}