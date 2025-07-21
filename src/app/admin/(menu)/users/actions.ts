'use server';
/** 
 * https://github.com/atmulyana/nextCart
 **/
import {forbidden, notFound} from 'next/navigation';
import lang from '@/data/lang/server';
import {dbTrans} from '@/data/db-conn';
import {deleteUser, getUserById} from '@/data/user';
import {getSession} from '@/data/session';
import {createFormAction} from "@/lib/routeHandler";

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