/** 
 * https://github.com/atmulyana/nextCart
 **/
import React from 'react';
import Link from 'next/link';
import {forbidden, notFound} from 'next/navigation';
import config from '@/config';
import lang from '@/data/lang';
import {getUsers} from '@/data/user';
import {fnMeta} from '@/lib/common';
import DeleteButton from '@/subview/components/DeleteButton';
import Icon from '@/subview/components/Icon';
import Form from '@/subview/components/Form';
import Template from '@/subview/partials/Template';
import {remove} from './actions';

export const generateMetadata = fnMeta(async () => {
    return {
        title: `${config.cartTitle}: ${lang('Users')}`,
    };
});

export default async function AdminUsers() {
    const users = await getUsers();
    let _id: string = '';

    return <Template>
        <h2>{lang('Users')}</h2>
        <ul className='bordered'>
            <li className='!flex bg-gray-200 dark:bg-gray-800'>
                <strong className='flex-1'>{lang('Name')}</strong>
                <strong className='w-1/4 shrink-0 ml-4'>{lang('Email address')}</strong>
                <strong className='w-1/4 shrink-0 ml-4'>{lang('Role')}</strong>
                <strong className='ml-4'>{lang('Edit')}</strong>
                <strong className='ml-4'>{lang('Delete')}</strong>
            </li>
            {users.map(u => (_id = u._id.toString(),
                <li key={_id} className='!flex bg-[--bg-color]'>
                    <div className='flex-1'>{u.usersName}</div>
                    <div className='w-1/4 shrink-0 ml-4'>{u.userEmail}</div>
                    <div className='w-1/4 shrink-0 ml-4'>{
                        u.isAdmin && <span>Admin{u.isOwner && ' (Owner)'}</span>
                        || <span>User</span>
                    }</div>
                    <div className='relative ml-4'>
                        <strong className='opacity-0'>{lang('Edit')}</strong>
                        <span className='absolute left-0 top-0 right-0 bottom-0 text-center'>
                            <Link href={`/admin/users/edit//${_id}`}><Icon name='edit' /></Link>
                        </span>
                    </div>
                    <span className='relative ml-4'>
                        <strong className='opacity-0'>{lang('Delete')}</strong>
                        <Form 
                            action={remove}
                            className='!absolute left-0 top-0 right-0 bottom-0 text-center text-[--color-danger]'
                            loading={null}
                            refreshThreshold='success'
                        >
                            <input type='hidden' name='id' value={_id} />
                            <DeleteButton question={lang('Are you sure you want to proceed?')} />
                        </Form>
                    </span>
                </li>
            ))}
        </ul>
    </Template>;
}