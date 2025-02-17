'use client';
/** 
 * https://github.com/atmulyana/nextCart
 **/
import * as React from 'react';
import {useFormStatus} from "react-dom";
import {setRef} from 'reactjs-common';
import {useSchemaProps} from './SchemaContext';

type InputProps = React.ComponentProps<'select'>;
type Props = Omit<InputProps, 'disabled'> & {useState?: boolean};
type StatedProps = Omit<InputProps, 'defaultValue' | 'onChange'> & {
    onChange: NonNullable<Props['onChange']>,
};

const StatedSelect = React.forwardRef<HTMLSelectElement, StatedProps>(function StatedSelect(
    {
        children,
        value,
        onChange,
        ...props
    },
    ref
) {
    const inputRef = React.useRef<HTMLSelectElement | null>(null);
    const [val, setVal] = React.useState(value);

    React.useEffect(() => {
        setVal(value);
    }, [value]);
    
    React.useEffect(() => {
        /* When re-rendering after form validation the combobox's value is reverted to the initial value
           even if `val` doesn't change. (Should be a React's bug) */
        if (inputRef.current) {
            const inp = inputRef.current,
                  opts = inp.options;
            if (typeof(val) == 'number') {
                inp.value = opts[val].value;
            }
            else if (typeof(val) == 'string') {
                inp.value = val;
                if (inp.selectedIndex < 0) inp.selectedIndex = 0;
            }
            else if (Array.isArray(val)) {
                for (let opt of opts) {
                    opt.selected = val.includes(opt.value);
                }
            }
            else {
                inp.selectedIndex = 0;
            }
        }
    });
    
    const changeHandler = (ev: React.ChangeEvent<HTMLSelectElement>) => {
        setVal(ev.target.value);
        onChange(ev);
    };

    return <select
        ref={(inp: HTMLSelectElement | null) => {
            if (ref) setRef(ref, inp);
            inputRef.current = inp;
        }}
        {...props}
        value={val}
        onChange={changeHandler}
    >{children}</select>;
});

const _SubmittedSelect = React.memo(function _SubmittedSelect({
    $ref,
    children,
    name,
    defaultValue,
    onChange,
    useState,
    ...props
}: Props & {
    $ref: React.Ref<HTMLSelectElement>
}) {
    const {pending} = useFormStatus();
    const getProps = useSchemaProps();

    const changeHandler = React.useCallback<React.ChangeEventHandler<HTMLSelectElement>>(ev => {
        if (ev.target.validity.customError) ev.target.setCustomValidity('');
        if (typeof(onChange) == 'function') onChange(ev);
    }, [onChange]);

    if (defaultValue === undefined && (onChange === undefined || useState)) {
        return <StatedSelect ref={$ref} {...props} {...getProps(name)} disabled={pending} onChange={changeHandler}>{children}</StatedSelect>;
    }
    else {
        return <select ref={$ref} {...props} {...getProps(name)} defaultValue={defaultValue} disabled={pending} onChange={changeHandler}>
            {children}
        </select>;
    }
});

const SubmittedSelect = React.forwardRef<HTMLSelectElement, Props>(function SubmittedSelect({children, ...props}, ref) {
    return <_SubmittedSelect {...props} $ref={ref}>{children}</_SubmittedSelect>;
});
export default SubmittedSelect;