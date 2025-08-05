'use client';
/** 
 * https://github.com/atmulyana/nextCart
 **/
import React from 'react';
import Input from '@/components/SubmittedInput';
export {default as DeleteButton} from '@/components/DeleteButton';

export function PublishedCheckBox({checked}: {checked?: boolean}) {
    return <Input type='checkbox' name='published' noValidation checked={checked} onChange={ev => ev.target.form?.requestSubmit()} />;
}