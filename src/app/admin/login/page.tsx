/** 
 * https://github.com/atmulyana/nextCart
 **/
import React from 'react';
import type {Metadata} from 'next';
import {redirect} from 'next/navigation';
import config from '@/config';
import lang from '@/data/lang';
import {userCount} from '@/data/user';
import DarkModeMenu from '@/subview/partials/DarkModeMenu';
import LanguangeMenu from '@/subview/partials/LanguageMenu';
import LoginForm from '@/subview/partials/LoginForm';
import {POST} from '../login_action/route';

export function generateMetadata(): Metadata {
    return  {
        title: {
            absolute: lang('Login')
        },
    };
}

async function submit(formData: FormData) {
    "use server";
    return await POST.responseJson(formData);
}

export default async function UserLoginPage() {
    if (await userCount() < 1) redirect('/admin/setup');
    return <> 
        <div className='fixed top-0 right-0 flex gap-4 py-2 px-4'>
            <DarkModeMenu />
            {config.enableLanguages && <LanguangeMenu />}
        </div>
        <LoginForm submitHandler={submit} />
    </>;
}