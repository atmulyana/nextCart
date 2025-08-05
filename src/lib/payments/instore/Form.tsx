/** 
 * https://github.com/atmulyana/nextCart
 **/
import React from 'react';
import type {Config} from '../types';
import Form from '@/components/Form';
import {POST} from './routes/checkout_action';

export default function InstoreForm({buttonText, description}: Config) {
    return <Form
        action={async function(formData: FormData) {
            'use server';
            return POST.responseJson(formData);
        }}
        method='post'
        className='block'
    >
        <div className='mb-2'>{description}</div>
        <button className='btn-outline-success' type='submit'>{buttonText}</button>
    </Form>;
}