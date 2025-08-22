/** 
 * https://github.com/atmulyana/nextCart
 **/
import React from 'react';
import {notFound, redirect} from 'next/navigation';
import {CheckBox} from '@react-input-validator/web';
import config from '@/config';
import lang from '@/data/lang';
import {getUserById, userCount} from '@/data/user';
import {getSession} from '@/data/session';
import {TUser} from '@/data/types';
import {awaitProps, fnMeta} from '@/lib/common';
import Form from '@/components/FormWithSchema';
import GoBackButton from '@/components/GoBackButton';
import Input from '@/components/SubmittedInput';
import SaveButton from '@/components/SubmitButton';
import Template from '@/components/partials/Template';
import DeleteButton from './DeleteButton';
import {save} from '../actions';

export const generateMetadata = fnMeta<{id?: string}>(async ({params: {id}}) => {
    return {
        title: `${config.cartTitle}: ${id ? lang('User edit') : lang('New user')}`,
    };
});

export default async function UesrForm(props: {params: Promise<{id?: string}>}) {
    const {params: {id}} = await awaitProps(props);
    let user: TUser | undefined | null;
    if (id) {
        user = await getUserById(id);
        if (!user) return notFound();
    }
    const session = await getSession();
    const sessionUserId = session.userId?.toString();
    const numOfUser = await userCount();
    if (
        !sessionUserId /* Not logged in */
        && numOfUser > 0 /* Not first user setup */
    ) {
        redirect('/admin/login');
    }
    
    return <Template>
        <Form id='userForm' action={save} schemaName='user' className='block'>
            {id && <Input type='hidden' name='id' value={id} />}
            
            <div className='flex items-baseline pb-5'>
                <h2 className='flex-auto'>{id ? lang('User edit') : lang('New user')}</h2>
                <SaveButton className='btn-outline-success ml-4'>{lang('Save')}</SaveButton>
                {id && session.isAdmin && <DeleteButton
                    id={id}
                    deleteLabel={lang('Delete')}
                    question={lang('Are you sure you want to proceed?')}
                />}
                {numOfUser > 0 && <GoBackButton className='ml-4' label={lang('Go Back')} />}
            </div>

            <div className='flex flex-col mb-4'>
                <label htmlFor='userName'>{lang('Name')}</label>
                <Input name='name' id='userName' type='text' value={user?.usersName} />
            </div>

            <div className='flex flex-col mb-4'>
                <label htmlFor='userEmail'>{lang('Email address')}</label>
                <Input name='email' id='userEmail' type='text' value={user?.userEmail} readOnly={!!id && id != sessionUserId} />
            </div>

            <div className='flex flex-col mb-4'>
                <label htmlFor='userPassword'>{lang('Password')}</label>
                <Input name='password' id='userPassword' type='password' />
                {id && <div className='text-gray-500'>{lang('Only populate if wanting to reset the customers password')}</div>}
            </div>

            <div className='flex flex-col mb-4'>
                <label htmlFor='userPasswordConfirm'>{lang('Password confirm')}</label>
                <Input name='passwordConfirm' id='userPasswordConfirm' type='password' />
            </div>

            {session.isAdmin && sessionUserId != id &&
            <div className='flex items-center mb-4'>
                <CheckBox name='isAdmin' noIndeterminate id='userIdAdmin' value={user?.isAdmin} />
                <label htmlFor='userIdAdmin' className='ml-2'>{lang('User is admin?')}</label>
            </div>}
        </Form>
    </Template>;
}