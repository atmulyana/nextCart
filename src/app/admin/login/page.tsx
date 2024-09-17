/** 
 * https://github.com/atmulyana/nextCart
 **/
import React from 'react';
import type {Metadata} from 'next';
import {redirect} from 'next/navigation';
import LoginForm from '@/subview/partials/LoginForm';
import lang from '@/data/lang';
import {userCount} from '@/data/user';
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
    return <LoginForm submitHandler={submit} />;
}