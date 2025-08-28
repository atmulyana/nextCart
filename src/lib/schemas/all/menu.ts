/** 
 * https://github.com/atmulyana/nextCart
 **/
import {required, rule} from '@react-input-validator/rules';
import lang from '@/data/lang';
import {Schema} from '..';
import messages from '../messages';

export default new Schema({
    title: required,
    link: [
        required,
        rule(
            value => {
                try {
                    new URL(value, "http://localhost");
                    return true;
                }
                catch {
                    return false;
                }
            },
            lang(messages.url)
        )
    ]
});