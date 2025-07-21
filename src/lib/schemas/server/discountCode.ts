/** 
 * https://github.com/atmulyana/nextCart
 **/
import {Required, rule, ruleAsync} from '@react-input-validator/rules';
import {getDiscountByCode} from '@/data/discount';
import lang from '@/data/lang';
import {Schema} from '..';

export default new Schema({
    remove: rule((value: string | null, param) => {
        param.resultValue = value !== null;
        return true;
    }),
    discountCode: [
        Required.If(
            (_, param) => !param.inputValues?.['remove']
        ),
        ruleAsync(
            async (code, resolve, param) => {
                if (param.inputValues?.['remove']) {
                    resolve(true);
                    return;
                }
                let message: string | undefined;
                const discount = await getDiscountByCode(code);
                if(!discount){
                    message = lang('Discount code is not found');
                }
                else {
                    const now = Date.now();
                    if (now > discount.end.getTime()) {
                        message = lang('Discount code is expired');
                    }
                    if (now < discount.start.getTime()) {
                        message = lang('Discount code does not apply yet');
                    }
                }
                if (message) resolve(message);
                else {
                    param.resultValue = discount;
                    resolve(true);
                }
            }
        )
    ],
});