'use server';
/** 
 * https://github.com/atmulyana/nextCart
 **/
import bcrypt from "bcryptjs";
import {forbidden, notFound} from 'next/navigation';
import lang from '@/data/lang/server';
import {dbTrans} from '@/data/db-conn';
import type {TUser, WithoutId} from '@/data/types';
import {createUser, deleteUser, getUserById, updateUser, userCount, } from '@/data/user';
import {getSession} from '@/data/session';
import {redirectWithMessage} from "@/lib/auth";
import {ForbiddenError} from "@/lib/common";
import {createFormAction} from "@/lib/routeHandler";

export const save = createFormAction(async (formData, redirect) => {
    const id = formData.getString('id');
    return await dbTrans(async () => {
        const session = await getSession();
        const user: WithoutId<TUser> = {
            usersName: formData.getString('name'),
            userEmail: formData.getString('email'),
            isAdmin: false,
            isOwner: false,
        }
        if (formData.has('isAdmin')) user.isAdmin = formData.getBoolean('isAdmin', true);
        if (formData.getString('password')) user.userPassword = bcrypt.hashSync(formData.getString('password', false), 10);

        if (id) { //update
            if (!session.userId) throw new ForbiddenError();
            else if (session.userId.toString() == id) user.isAdmin = session.isAdmin ?? false;
            else if (!session.isAdmin) throw new ForbiddenError();
            
            await updateUser(id, user);
            await redirect('/admin/users', {
                message: lang('User account was updated successfully'),
                messageType: 'success'
            });
        }
        else {
            if (await userCount() < 1) {
                user.isAdmin = true;
                user.isOwner = true;
            }
            else {
                if (!session.isAdmin) throw new ForbiddenError();
            }

            await createUser(user);
            await redirect(
                user.isOwner /*First setup*/
                    ? '/admin/login'
                    : '/admin/users',
                {
                    message: lang('User account was created successfully'),
                    messageType: 'success'
                }
            );
        }
    });
});

export const remove = createFormAction(async (formData: FormData) => {
    const id = formData.getString('id');
    return await dbTrans(async () => {
        const user = await getUserById(id);
        if (!user) return notFound();
        const session = await getSession();

        if (user._id.equals(session.userId)) {
            return {
                message: lang('Unable to delete your own user account'),
            };
        }

        if (!session.isAdmin || user.isOwner) return forbidden();

        await deleteUser(id);
        return {
            message: lang('User successfully deleted'),
            messageType: 'success',
        };
    });
});
export async function erase(id: string) {
    const formData = new FormData();
    formData.set('id', id);
    const message = await remove(formData);
    if (message.messageType == 'success') {
        return await redirectWithMessage(
            '/admin/users',
            {
                message: message.message,
                type: message.messageType,
            }
        );
    }
    else {
        return message;
    }
}