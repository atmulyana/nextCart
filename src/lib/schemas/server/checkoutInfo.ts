/** 
 * https://github.com/atmulyana/nextCart
 **/
import {email, required, ruleAsync} from '@react-input-validator/rules';
import lang from '@/data/lang';
import {getCustomerByEmail} from '@/data/customer';
import clientRules from '../all/checkoutInfo';
import {Schema} from '..';
import messages from '../messages';
export default new Schema({
    ...clientRules.shape,
    email: [
        required,
        email,
        ruleAsync(async (value, resolve, {inputValues}) => {
            if (inputValues?.createAccount) {
                if (await getCustomerByEmail(value as string)) {
                    resolve(lang(messages.duplicateEmail));
                    return;
                }
            }
            resolve(true);
        }),
    ],
});