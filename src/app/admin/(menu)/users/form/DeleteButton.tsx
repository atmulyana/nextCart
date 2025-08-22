'use client';
/** 
 * https://github.com/atmulyana/nextCart
 **/
import React from 'react';
import {useFormContext} from '@/components/Form';
import DeleteButton from '@/components/DeleteButton';
import {useNotification} from '@/components/Notification';
import {isPlainObject} from '@/lib/common';
import {erase} from '../actions';

export default function DeleteBtn({
    id,
    deleteLabel,
    question,
}: {
    id: string,
    deleteLabel: string,
    question: string,
}) {
    const formCtx = useFormContext();
    const notify = useNotification();
    return <DeleteButton
        className='btn-outline-danger ml-4'
        question={question}
        preprocess={ok => {
            if (!ok) return false;
            const loading = formCtx.showLoading?.();
            if (!loading) return false;
            loading.ready(() => {
                erase(id)
                .then(resp => {
                    if (isPlainObject(resp) && 'message' in resp) {
                        notify(resp.message, resp.messageType);
                    }
                })
                .finally(() => loading.stop());
            });
            return false;
        }}
    >{deleteLabel}</DeleteButton>;
}