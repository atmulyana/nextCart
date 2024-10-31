/** 
 * https://github.com/atmulyana/nextCart
 **/
import React from 'react';
import type {Metadata} from 'next';
import {loginCustomer} from '@/app/actions';
import LoginForm from '@/subview/partials/LoginForm';
import lang from '@/data/lang';

export function generateMetadata(): Metadata {
    return  {
        title: {
            absolute: lang('Customer login')
        },
    };
}

export default async function LoginPage({searchParams}: {searchParams: Promise<{referrerUrl: string}>}) {
    const {referrerUrl} = await searchParams;
    return <LoginForm referrerUrl={referrerUrl} submitHandler={loginCustomer} />;
}