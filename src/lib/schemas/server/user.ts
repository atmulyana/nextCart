/** 
 * https://github.com/atmulyana/nextCart
 **/
import {boolean, ruleAsync} from '@react-input-validator/rules';
import ruleMessages from '@react-input-validator/rules/messages';
import lang from '@/data/lang';
import {getUserByEmail} from '@/data/user';
import {getSession} from '@/data/session';
import userSchema from '../all/user';
import {type RuleArray, Schema} from '..';
import messages from '../messages';

export default new Schema({
    ...userSchema.shape,
    email: [
        ...(userSchema.shape.email as RuleArray),
        ruleAsync(
            async (email, resolve, {inputValues}) => {
                const user = await getUserByEmail(email, inputValues?.id);
                resolve(!user);
            },
            lang(messages.duplicateUserEmail)
        )
    ],
    isAdmin: [
        ruleAsync(
            async (value: string | null, resolve, param) => {
                const session = await getSession();
                if (!session.isAdmin || param.inputValues?.id === session.userId?.toString()) resolve(true);
                else {
                    const val = value?.trim();
                    param.resultValue = val;
                    if (!val) resolve(lang(ruleMessages.required)); 
                    else resolve(true);
                }

            }
        ).setPriority(0),
        boolean,
    ],
});