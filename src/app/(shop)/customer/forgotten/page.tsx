/** 
 * https://github.com/atmulyana/nextCart
 **/
import React from 'react';
import type {Metadata} from 'next';
import lang from '@/data/lang';
import FormWithSchema from '@/components/FormWithSchema';
import Input from '@/components/SubmittedInput';
import SubmitButton from '@/components/SubmitButton';
import Template from '@/components/partials/Template';
import {POST} from '../forgotten_action/route';

export function generateMetadata(): Metadata {
    return  {
        title: {
            absolute: lang('Forgotten password')
        },
    };
}

export default async function ForgottenPage() {
    return <Template><div className='relative w-full px-3.5 pt-24 md:max-w-[33.333333%] md:grow-0 md:shrink-0 md:basis-1/3 mx-auto'>
        <FormWithSchema schemaName='forgottenPassword' action={async function(formData: FormData) {
            'use server';
            return await POST.responseJson(formData);
        }}>
            <h2>{lang('Please enter your email address')}</h2>
            <div className='mb-4'>
                <Input name='email' placeholder={lang('Email address')} autoFocus />
            </div>
            <SubmitButton className='block w-full btn-outline-primary'>{lang('Reset')}</SubmitButton>
        </FormWithSchema>
    </div></Template>;
}