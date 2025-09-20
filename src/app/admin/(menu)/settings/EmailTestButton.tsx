'use client';
/** 
 * https://github.com/atmulyana/nextCart
 **/
import React from 'react';
import Button from '@/components/SubmitButton';
import {useFormContext} from '@/components/Form';
import {useNotification} from '@/components/Notification';
import {isPlainObject} from '@/lib/common';
import {sendEmailTest} from './actions';

export default function EmailTestButton({label}: {label: string}) {
    const ctx = useFormContext();
    const notify = useNotification();
    return <Button
        type='button'
        className='btn-outline-success'
        onClick={() => {
            const address = ctx.validation?.getInput('email.fromAddress'),
                  host = ctx.validation?.getInput('email.host'),
                  port = ctx.validation?.getInput('email.port'),
                  secure = ctx.validation?.getInput('email.secure'),
                  user = ctx.validation?.getInput('email.user'),
                  password = ctx.validation?.getInput('email.password');
            const isValid = [
                address,
                host,
                port,
                secure,
                user,
                password,
            ].reduce(
                (isValid, input) => !!input?.validate() && isValid,
                true
            );
            if (isValid) {
                sendEmailTest(
                    address?.getValue() as string,
                    host?.getValue() as string,
                    parseInt(port?.getValue()),
                    secure?.getValue().toString() == 'true',
                    user?.getValue() as string,
                    password?.getValue() as string
                ).then(resp => {
                    if (isPlainObject(resp)) {
                        notify(resp.message, resp.messageType as any);
                    }
                });
            }
        }}
    >{label}</Button>;
}