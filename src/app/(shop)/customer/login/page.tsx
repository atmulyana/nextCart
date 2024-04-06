/** 
 * https://github.com/atmulyana/nextCart
 **/
import React from 'react';
import type {Metadata} from 'next';
import {redirect} from 'next/navigation';
import LoginForm from '@/partials/LoginForm';
import lang from '@/data/lang';
import {getSession} from '@/data/session';
import {POST} from '../login_action/route';

export function generateMetadata(): Metadata {
    return  {
        title: {
            absolute: lang('Customer login')
        },
    };
}

async function submit(formData: FormData) {
    "use server";
    return await POST.responseJson(formData);
}

export default async function LoginPage({searchParams: {referrerUrl}}: {searchParams: {referrerUrl: string}}) {
    const session = await getSession();
    if (session.customerPresent) redirect('/customer/account');
    return <LoginForm referrerUrl={referrerUrl} submitHandler={submit} />;
}