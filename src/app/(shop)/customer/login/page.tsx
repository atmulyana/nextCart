/** 
 * https://github.com/atmulyana/nextCart
 **/
import React from 'react';
import type {Metadata} from 'next';
import LoginForm from '@/partials/LoginForm';
import lang from '@/data/lang';
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
    return <LoginForm referrerUrl={referrerUrl} submitHandler={submit} />;
}