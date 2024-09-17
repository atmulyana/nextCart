'use client';
/** 
 * https://github.com/atmulyana/nextCart
 **/
import * as React from 'react';
import {useFormStatus} from "react-dom";
import {useSchemaProps} from './SchemaContext';

export default function SubmittedSelect({children, name, value, onChange, ...props}: Omit<React.ComponentProps<'select'>, 'disabled'>) {
    const {pending} = useFormStatus();
    const [val, setVal] = React.useState(value);
    const getProps = useSchemaProps();

    React.useEffect(() => {
        setVal(value);
    }, [value]);

    const changeHandler = React.useCallback<React.ChangeEventHandler<HTMLSelectElement>>(ev => {
        setVal(ev.target.value);
        if (ev.target.validity.customError) ev.target.setCustomValidity('');
        if (typeof(onChange) == 'function') onChange(ev);
    }, [onChange]);

    return <select {...props} {...getProps(name)} value={val} onChange={changeHandler} disabled={pending}>{children}</select>;
}