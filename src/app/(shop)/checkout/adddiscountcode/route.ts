/** 
 * https://github.com/atmulyana/nextCart
 **/
const bcrypt = require('bcryptjs');
import {ResponseMessage} from '@/lib/common';
import modules from '@/lib/modules';
import {createPostHandler} from '@/lib/routeHandler';
import lang from '@/data/lang';
import {getDiscountByCode} from '@/data/discount';

export const POST = createPostHandler(async (formData) => {
    const code = formData.getString('discountCode');
    
    // Check if the discount module is loaded
    if(!modules.discount){
        return ResponseMessage(lang('Access denied'), 403);
    }

    if (typeof(code) != 'string' || !code) {
        return ResponseMessage(lang('Discount code is required'), 400);
    }

    const discount = await getDiscountByCode(code);
    if(!discount){
        return ResponseMessage(lang('Discount code is not found'), 404);
    }

    const now = Date.now();
    if (now > discount.end.getTime()) {
        return ResponseMessage(lang('Discount is expired'), 410);
    }
    if (now < discount.start.getTime()) {
        return ResponseMessage(lang('Discount does not apply yet'), 451);
    }

    return {
        message: lang('Discount code applied'),
        messageType: 'success',
        discount,
    };
});