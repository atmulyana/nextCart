/** 
 * https://github.com/atmulyana/nextCart
 **/
import {emptyString} from 'javascript-common';
import {ValidationRule} from '@react-input-validator/rules';
import messages from '../messages';

export default class Enum extends ValidationRule<any> {
    #values!: any[];
    constructor(validValues: any[]) {
        super();
        this.#values = validValues;
    }

    get errorMessage() {
        let values: string = emptyString;
        if (this.#values.length == 1) values = this.#values[0];
        else {
            values = this.#values.slice(0, this.#values.length - 1).join(', ')
                + ' ' + this.lang('or') + ' '
                + this.#values[this.#values.length - 1];
        }
        return `${this.lang(messages.enum)}: ${values}`;
    }
    validate() {
        this.isValid = this.#values.includes(this.value); 
        return this;
    }
}

export const enums = (values: any[]) => new Enum(values);