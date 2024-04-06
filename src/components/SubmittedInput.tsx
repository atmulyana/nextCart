'use client';
/** 
 * https://github.com/atmulyana/nextCart
 **/
import * as React from 'react';
import {useFormStatus} from "react-dom";
import {useSchemaProps} from './SchemaContext';

type Props = Omit<React.ComponentProps<'input'>, 'disabled'>; 

const SubmittedInput = React.forwardRef<HTMLInputElement, Props>(function SubmittedInput({name, onChange, ...props}, ref) {
    const {pending} = useFormStatus();
    const getProps = useSchemaProps();

    const changeHandler = React.useCallback<React.ChangeEventHandler<HTMLInputElement>>(ev => {
        if (ev.target.validity.customError) ev.target.setCustomValidity('');
        if (typeof(onChange) == 'function') onChange(ev);
    }, [onChange]);

    return <input ref={ref} {...getProps(name)} {...props} onChange={changeHandler} disabled={pending} />;
});

export default SubmittedInput;