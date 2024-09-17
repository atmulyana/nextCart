/** 
 * https://github.com/atmulyana/nextCart
 **/
import React from 'react';
import lang from '@/data/lang';
import type {Config} from '../types';
import Form from './FormClient';
import {POST} from './routes/checkout_action';

export default function StripeForm({buttonText, description, publicKey}: Config) {
    return <Form {...{
        action: async function(formData: FormData) {
            'use server';
            return POST.responseJson(formData);
        },
        buttonText,
        description,
        failedMessage: lang('Failed to complete transaction'),
        publicKey: publicKey.toString(),
    }} />;
}