/** 
 * https://github.com/atmulyana/nextCart
 **/
import {ValidationRule} from '@react-input-validator/rules';

export default class StrVal extends ValidationRule<any> {
    validate() {
        this.isValid = typeof(this.value) == 'string';
        return this;
    }
}

export const strval = new StrVal();