/** 
 * https://github.com/atmulyana/nextCart
 **/
import React from 'react';
import type {Config} from '../types';
import Form from '@/subview/components/Form';

export default function PaypalForm({buttonText, description}: Config) {
    return <Form action='/paypal/checkout_action' method='post' className='block'>
        <div className='mb-2'>{description}</div>
        <button className='btn-outline-success' type='submit'>{buttonText}</button>
    </Form>;
}