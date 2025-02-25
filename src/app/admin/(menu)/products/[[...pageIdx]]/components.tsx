'use client';
/** 
 * https://github.com/atmulyana/nextCart
 **/
import React from 'react';
import Input from '@/subview/components/SubmittedInput';
export {default as DeleteButton} from '@/subview/components/DeleteButton';

export function PublishedCheckBox({checked}: {checked?: boolean}) {
    return <Input type='checkbox' name='published' checked={checked} onChange={ev => ev.target.form?.requestSubmit()} useState />;
}