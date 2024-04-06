/** 
 * https://github.com/atmulyana/nextCart
 **/
const bcrypt = require('bcryptjs');
import {ResponseMessage} from '@/lib/common';
import {createPostHandler} from '@/lib/routeHandler';
import lang from '@/data/lang';
import {getUserByEmail} from '@/data/user';
import {setUserSession} from '@/data/session';

export const POST = createPostHandler(async (formData, redirect, isFromMobile) => {
    const email = formData.getString('loginEmail');
    const password = formData.getString('loginPassword');
    
    const user = email && await getUserByEmail(email);
    if (!user) {
        return ResponseMessage(lang('A user with that email does not exist.'), 400);
    }

    const cannotLogin = ResponseMessage(lang('Access denied. Check password and try again.'), 400);
    try {
        const isPwdValid: boolean = await bcrypt.compare(password, user.userPassword);
        if (!isPwdValid) return cannotLogin;
    }
    catch {
        return cannotLogin;
    }

    if (await setUserSession(user._id)) {
        if (isFromMobile) return Response.json({
            message: lang('Successfully logged in'),
            messageType: 'success',
            user
        });
        return redirect('/admin');
    }
    else {
        return cannotLogin;
    }
});