/** 
 * https://github.com/atmulyana/nextCart
 **/
const bcrypt = require('bcryptjs');
import {ResponseMessage} from '@/lib/common';
import {createPostHandler} from '@/lib/routeHandler';
import {dbTrans, toId} from '@/data/db-conn';
import lang from '@/data/lang';
import {addCartItems, getCartById, deleteCart, deleteCartItems, upsertCart} from '@/data/cart';
import {getCustomerByEmail} from '@/data/customer';
import {getSessionId, setCustomerSession} from '@/data/session';
import {checkStock, updateTotalCart} from '@/lib/cart';

export const POST = createPostHandler(async (formData, redirect, isFromMobile) => {
    const email = formData.getString('loginEmail').trim();
    const password = formData.getString('loginPassword');
    
    const customer = email && await getCustomerByEmail(email);
    if (!customer) {
        return ResponseMessage(lang('A customer with that email does not exist.'), 400);
    }

    const cannotLogin = ResponseMessage(lang('Access denied. Check password and try again.'), 400);
    try {
        const isPwdValid: boolean = await bcrypt.compare(password, customer.password);
        if (!isPwdValid) return cannotLogin;
    }
    catch {
        return cannotLogin;
    }

     if (await dbTrans(async () => {
        if (await setCustomerSession(customer._id)) {
            const sessionId = getSessionId();
            const cartBySession = sessionId && await getCartById(sessionId);
            const cartByCustomer = await getCartById(customer._id);
            if (cartBySession && !cartByCustomer) {
                await upsertCart(customer._id, cartBySession);
                await addCartItems(
                    customer._id,
                    Object.entries(cartBySession.items).map(item => ({
                        ...item[1],
                        id: item[0],
                    }))
                );
                await deleteCart(sessionId);
            }
            else if (cartByCustomer) {
                const deletedItemIds: string[] = [];
                for (let cartItemId in cartByCustomer.items) {
                    if (checkStock(cartByCustomer.items[cartItemId])) { //any problem with the stock
                        delete cartByCustomer.items[cartItemId];
                        deletedItemIds.push(cartItemId);
                    }
                    else if (cartBySession && (cartItemId in cartBySession.items)) {
                        delete cartByCustomer.items[cartItemId];
                        deletedItemIds.push(cartItemId);
                    }
                }
                if (deletedItemIds.length > 0) await deleteCartItems(customer._id, deletedItemIds);
                
                if (cartBySession) {
                    if (cartBySession.discount) cartByCustomer.discount = cartBySession.discount;
                    cartByCustomer.items = {
                        ...cartByCustomer.items,
                        ...cartBySession.items,
                    };
                    await addCartItems(
                        customer._id,
                        Object.entries(cartBySession.items).map(item => ({
                            ...item[1],
                            id: item[0],
                        }))
                    );
                    await deleteCart(sessionId);
                }

                updateTotalCart(cartByCustomer, {customerCountry: customer.country});
                await upsertCart(customer._id, cartByCustomer);
            }
            return true;
        }
        return false;
    })) {
        if (isFromMobile) return Response.json({
            message: lang('Successfully logged in'),
            messageType: 'success',
            customer
        });
        return redirect(formData.get('referrerUrl'), '/customer/account');
    }
    else {
        return cannotLogin;
    }
});