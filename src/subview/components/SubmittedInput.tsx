'use client';
/** 
 * https://github.com/atmulyana/nextCart
 **/
import * as React from 'react';
import {useFormStatus} from "react-dom";
import {setRef} from 'reactjs-common';
import {useSchemaProps} from './SchemaContext';

type InputProps = React.ComponentProps<'input'>;
type Props = Omit<InputProps, 'disabled'> & {useState?: boolean};
type StatedProps = Omit<InputProps, 'defaultValue' | 'defaultChecked' | 'onChange'> & {
    onChange: NonNullable<Props['onChange']>,
};

const nonEditableTypes = ['button', 'image', 'reset', 'submit'].reduce(
    (obj, type) => (obj[type] = true, obj),
    {} as {[type: string]: boolean}
);
const checkableTypes: {[type: string]: boolean} = {
    checkbox: true,
    radio: true,
};

function getDefaultValue(props: Props) {
    // if (props.type == 'number') return 0;
    // if (props.type == 'range') return props.min ?? 0;
    // if (props.multiple && ['email', 'file'].includes(props.type ?? '')) return [] as string[];
    return '';
}

const CheckableInput = React.forwardRef<HTMLInputElement, StatedProps>(function CheckableInput(
    {
        checked,
        onChange,
        ...props
    },
    ref
) {
    const inputRef = React.useRef<HTMLInputElement | null>(null);
    const [check, setCheck] = React.useState(checked ?? false);
    
    React.useEffect(() => {
        setCheck(checked ?? false);
    }, [checked]);

    React.useEffect(() => {
        /* Sometimes, the checkbox is not checked when `check` is `true` (Should be a React's bug) */
        if (inputRef.current) inputRef.current.checked = check;
    });

    const changeHandler = (ev: React.ChangeEvent<HTMLInputElement>) => {
        setCheck(ev.target.checked);
        onChange(ev);
    };

    return <input
        ref={(inp: HTMLInputElement | null) => {
            if (ref) setRef(ref, inp);
            inputRef.current = inp;
        }}
        {...props}
        checked={check}
        onChange={changeHandler}
    />;
});


const NonCheckableInput = React.forwardRef<HTMLInputElement, StatedProps>(function NonCheckableInput(
    {
        value,
        onChange,
        ...props
    },
    ref
) {
    const [val, setVal] = React.useState(value ?? getDefaultValue(props));
    
    React.useEffect(() => {
        setVal(value ?? getDefaultValue(props));
    }, [value]);

    const changeHandler = (ev: React.ChangeEvent<HTMLInputElement>) => {
        setVal(ev.target.value);
        onChange(ev);
    };

    return <input
        ref={ref}
        {...props}
        value={val}
        autoComplete={props.type == 'password' ? 'off' : props.autoComplete}
        onChange={changeHandler}
    />;
});

const _SubmittedInput = React.memo(function _SubmittedInput({
    $inputRef,
    name,
    type = 'text',
    value,
    defaultValue,
    checked,
    defaultChecked,
    onChange,
    useState,
    ...props
}: Props & {
    $inputRef: React.Ref<HTMLInputElement>
}) {
    type = type.toLowerCase();
    const {pending} = useFormStatus();
    const getProps = useSchemaProps();

    const changeHandler = React.useCallback<React.ChangeEventHandler<HTMLInputElement>>(ev => {
        const input = ev.target;
        if (input.validity.customError) input.setCustomValidity('');
        if (typeof(onChange) == 'function') onChange(ev);
    }, [onChange]);

    if (checkableTypes[type]) {
        if (defaultChecked === undefined && (onChange === undefined || useState)) {
            return <CheckableInput
                ref={$inputRef}
                {...props}
                {...{type, value, checked}}
                {...getProps(name)}
                disabled={pending}
                onChange={changeHandler}
            />;
        }
    }
    else if (!nonEditableTypes[type]) {
        if (defaultValue === undefined && (onChange === undefined || useState)) {
            return <NonCheckableInput
                ref={$inputRef}
                {...props}
                {...{type, value}}
                {...getProps(name)}
                disabled={pending}
                onChange={changeHandler}
            />;
        }
    }

    return <input
        ref={$inputRef}
        {...props}
        {...{type, value, defaultValue, checked, defaultChecked}}
        {...getProps(name)}
        disabled={pending}
        onChange={changeHandler}
    />;
});

const SubmittedInput = React.forwardRef<HTMLInputElement, Props>(function SubmittedInput(props, ref) {
    return <_SubmittedInput {...props} $inputRef={ref} />;
});
export default SubmittedInput;