/** 
 * https://github.com/atmulyana/nextCart
 **/
import React from 'react';
import {headers} from 'next/headers';
import lang from '@/data/lang';
import FormWithSchema from '@/subview/components/FormWithSchema';
import Input from '@/subview/components/SubmittedInput';
import Template from '@/subview/partials/Template';

export type LoginFormProps = {
    referrerUrl?: string | null,
    submitHandler: Exclude<NonNullable<React.ComponentProps<'form'>['action']>, string>,
}

export default async function LoginForm({referrerUrl, submitHandler}: LoginFormProps) {
    if (!referrerUrl) {
        try {
            referrerUrl = (await headers()).get('referrer');
        }
        catch {}
    }

    return <Template><div className='relative w-full px-3.5 pt-24 md:max-w-[33.333333%] md:grow-0 md:shrink-0 md:basis-1/3 mx-auto'>
        <FormWithSchema schemaName='login' action={submitHandler}>
            <input type='hidden' name='referrerUrl' value={referrerUrl || ''} />
            <h2>{lang('Please sign in')}</h2>
            <div className='mb-4'>
                <Input name='loginEmail' placeholder={lang('Email address')} autoFocus />
            </div>
            <div className='mb-4'>
                <Input type='password' name='loginPassword' placeholder={lang('Password')} />
            </div>
            <button type='submit' className='block w-full btn-outline-primary'>{lang('Sign in')}</button>
        </FormWithSchema>
    </div></Template>;
}