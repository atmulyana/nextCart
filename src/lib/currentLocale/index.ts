/** 
 * https://github.com/atmulyana/nextCart
 **/
import {isOnBrowser} from '../common';

let mod: any;
if (isOnBrowser()) {
    mod = require('./client');
}
else {
    //@ts-ignore: webpack alias
    mod = require('@__server__');
}
export default mod.default;