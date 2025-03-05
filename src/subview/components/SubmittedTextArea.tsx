'use client';
/** 
 * https://github.com/atmulyana/nextCart
 **/
import * as React from 'react';
import {useFormStatus} from "react-dom";
import {useSchemaProps} from './SchemaContext';

type InputProps = React.ComponentProps<'textarea'>;
type Props = Omit<InputProps, 'disabled'> & {useState?: boolean};
type StatedProps = Omit<InputProps, 'defaultValue' | 'onChange'> & {
    onChange: NonNullable<Props['onChange']>,
};

const StatedTextArea = React.forwardRef<HTMLTextAreaElement, StatedProps>(function StatedTextArea(
    {
        value,
        onChange,
        ...props
    },
    ref
) {
    const [val, setVal] = React.useState(value);

    React.useEffect(() => {
        setVal(value);
    }, [value]);
    
    const changeHandler = (ev: React.ChangeEvent<HTMLTextAreaElement>) => {
        setVal(ev.target.value);
        onChange(ev);
    };

    return <textarea ref={ref} {...props} value={val} onChange={changeHandler} />;
});

const InternalTextArea = React.memo(function InternalTextArea({
    $ref,
    name,
    defaultValue,
    onChange,
    useState,
    ...props
}: Props & {
    $ref: React.Ref<HTMLTextAreaElement>
}) {
    const {pending} = useFormStatus();
    const getProps = useSchemaProps();

    const changeHandler = React.useCallback<React.ChangeEventHandler<HTMLTextAreaElement>>(ev => {
        if (ev.target.validity.customError) ev.target.setCustomValidity('');
        if (typeof(onChange) == 'function') onChange(ev);
    }, [onChange]);

    if (defaultValue === undefined && (onChange === undefined || useState)) {
        return <StatedTextArea ref={$ref} {...props} {...getProps(name)} disabled={pending} onChange={changeHandler} />;
    }
    else {
        return <textarea ref={$ref} {...props} {...getProps(name)} defaultValue={defaultValue} disabled={pending} onChange={changeHandler} />;
    }
});

const SubmittedTextArea = React.forwardRef<HTMLTextAreaElement, Props>(function SubmittedTextArea(props, ref) {
    return <InternalTextArea {...props} $ref={ref} />;
});
export default SubmittedTextArea;