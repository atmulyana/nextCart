/** 
 * https://github.com/atmulyana/nextCart
 **/
import React from 'react';
import type {Metadata} from 'next';
import {loginCustomer} from '@/app/actions';
import LoginForm from '@/partials/LoginForm';
import lang from '@/data/lang';

export function generateMetadata(): Metadata {
    return  {
        title: {
            absolute: lang('Customer login')
        },
    };
}

export default async function LoginPage({searchParams: {referrerUrl}}: {searchParams: {referrerUrl: string}}) {
    return <LoginForm referrerUrl={referrerUrl} submitHandler={loginCustomer} />;
}