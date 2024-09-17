/** 
 * https://github.com/atmulyana/nextCart
 **/
import React from 'react';
import type {Config} from '../types';
import Form from './FormClient';

export default function PaypalForm({buttonText, description}: Config) {
    return <Form {...{
        buttonText,
        description,
    }} />;
}