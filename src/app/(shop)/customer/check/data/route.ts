/** 
 * https://github.com/atmulyana/nextCart
 **/
import lang from '@/data/lang';
import {getSession} from '@/data/session';
import {ResponseMessage} from '@/lib/common';
import {createGetHandler} from '@/lib/routeHandler';


export const GET = createGetHandler(async () => {
    const session = await getSession();
    if (session.customerPresent) {
        return ResponseMessage(lang('Customer logged in'), 200);
    }
    else {
        return ResponseMessage(lang('Not logged in'), 401);
    }
});