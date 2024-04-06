'use client';
/** 
 * https://github.com/atmulyana/nextCart
 **/
import * as React from 'react';
import {useFormStatus} from "react-dom";
import {useSchemaProps} from './SchemaContext';

export default function SubmittedTextArea({children, name, onChange, ...props}: Omit<React.ComponentProps<'textarea'>, 'disabled'>) {
    const {pending} = useFormStatus();
    const getProps = useSchemaProps();
    
    const changeHandler = React.useCallback<React.ChangeEventHandler<HTMLTextAreaElement>>(ev => {
        if (ev.target.validity.customError) ev.target.setCustomValidity('');
        if (typeof(onChange) == 'function') onChange(ev);
    }, [onChange]);

    return <textarea {...getProps(name)} {...props} onChange={changeHandler} disabled={pending}>{children}</textarea>;
}