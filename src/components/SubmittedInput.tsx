'use client';
/** 
 * https://github.com/atmulyana/nextCart
 **/
import * as React from 'react';
import {useFormStatus} from "react-dom";
import {useSchemaProps} from './SchemaContext';

type Props = Omit<React.ComponentProps<'input'>, 'disabled'>; 

function getDefaultValue(props: Props) {
    // if (props.type == 'number') return 0;
    // if (props.type == 'range') return props.min ?? 0;
    // if (props.multiple && ['email', 'file'].includes(props.type ?? '')) return [] as string[];
    return '';
}

const SubmittedInput = React.forwardRef<HTMLInputElement, Props>(function SubmittedInput(
    {
        name,
        value,
        defaultValue,
        checked,
        defaultChecked,
        onChange,
        ...props
    },
    ref
) {
    const {pending} = useFormStatus();
    const [val, setVal] = React.useState(value ?? getDefaultValue(props));
    const [check, setCheck] = React.useState(checked ?? false);
    const getProps = useSchemaProps();

    React.useEffect(() => {
        setVal(value ?? getDefaultValue(props));
    }, [value]);

    React.useEffect(() => {
        setCheck(checked ?? false);
    }, [checked]);

    const valueProps: {
        value?: typeof value,
        defaultValue?: typeof defaultValue,
        checked?: typeof checked,
        defaultChecked?: typeof defaultChecked,
    } = {};
    if (defaultValue !== undefined) valueProps.defaultValue = defaultValue;
    else valueProps.value = val;
    if (defaultChecked !== undefined) valueProps.defaultChecked = defaultChecked;
    else valueProps.checked = check;

    const changeHandler = React.useCallback<React.ChangeEventHandler<HTMLInputElement>>(ev => {
        const input = ev.target;
        setVal(input.value);
        if (['checkbox', 'radio'].includes(input.type)) setCheck(input.checked);
        if (input.validity.customError) input.setCustomValidity('');
        if (typeof(onChange) == 'function') onChange(ev);
    }, [onChange]);

    return <input
        ref={ref}
        {...props}
        {...getProps(name)}
        // value={val}
        // checked={check}
        {...valueProps}
        onChange={changeHandler}
        autoComplete={props.type == 'password' ? 'off' : props.autoComplete}
        disabled={pending}
    />;
});

export default SubmittedInput;