/** 
 * https://github.com/atmulyana/nextCart
 **/
import React from 'react';
import type {Metadata} from 'next';
// import {notFound} from 'next/navigation';
// import {getCustomerByResetToken} from '@/data/customer';
import lang from '@/data/lang';
import FormWithSchema from '@/components/FormWithSchema';
import Input from '@/components/SubmittedInput';
import SubmitButton from '@/components/SubmitButton';
import Template from '@/components/partials/Template';
import {POST} from './api/route';

export function generateMetadata(): Metadata {
    return  {
        title: {
            absolute: lang('Password reset')
        },
    };
}

export default async function ResetPasswordPage({params}: {params: Promise<{token: string}>}) {
    const {token} = await params;
    //if (!token || !(await getCustomerByResetToken(token))) return notFound();

    return <Template><div className='relative w-full px-3.5 pt-24 md:max-w-[33.333333%] md:grow-0 md:shrink-0 md:basis-1/3 mx-auto'>
        <FormWithSchema schemaName='resetPassword' action={async function(formData: FormData) {
            'use server';
            return await POST.responseJson(formData);
        }}>
            <h2>{lang('Password reset')}</h2>
            <div className='mb-4'>
                <label htmlFor="user_password" className='block mb-1 leading-4'>{lang('Password')} *</label>
                <Input type="password" id="user_password" name="password" placeholder={lang('Password')} />
            </div>
            <div className='mb-4'>
                <label htmlFor="frm_user_password_confirm" className='block mb-1 leading-4'>{lang('Password confirm')} *</label>
                <Input type="password" name="frm_user_password_confirm" placeholder={lang('Password confirm')} />
            </div>
            <input type='hidden' name='token' value={token||''} />
            <SubmitButton className='block w-full btn-outline-success'>{lang('Update')}</SubmitButton>
        </FormWithSchema>
    </div></Template>;
}