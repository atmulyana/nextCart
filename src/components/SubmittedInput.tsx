'use client';
/** 
 * https://github.com/atmulyana/nextCart
 **/
import React, { CSSProperties } from 'react';
import {setRef} from 'reactjs-common';
import {Input, type InpProps, type InpRef, type Rules} from '@react-input-validator/web';
import {useFormStatus} from "react-dom";
import {useSchemaProps} from './SchemaContext';

export type Props<NoValidation extends (boolean | undefined), Type extends string> = Omit<
    {
        noValidation?: NoValidation,
        type?: Type,
        value?: InpProps<Type>['value'],
    } & (
        NoValidation extends true
            ? Omit<React.ComponentProps<'input'>, 'type' | 'value'>
            : Omit<InpProps<Type>, 'rules' | 'style'> & {
                containerClass?: string,
                containerStyle?: CSSProperties,
                className?: string,
                rules?: Rules,
                style?: CSSProperties,
            }
    ),
    'disabled' | 'ref'
>;
export type Ref<NoValidation extends (boolean | undefined), Type extends string> = NoValidation extends true
    ? React.Ref<HTMLInputElement> : React.Ref<InpRef<Type>>;

const SubmittedInput = React.forwardRef(function SubmittedInput<
    Type extends string,
    NoValidation extends boolean | undefined = false,
>(
    {
        name,
        noValidation,
        onChange,
        value,
        ...props
    }: Props<NoValidation, Type>,
    ref: Ref<NoValidation, Type>
) {
    const inpRef = React.useRef<InpRef<Type>>(null);
    const {pending} = useFormStatus();
    const getProps = useSchemaProps();
    const Input2 = Input as typeof Input<Type>;

    React.useEffect(() => {
        if (!inpRef.current || onChange) return;
        if (!inpRef.current.isValid) inpRef.current.clearValidation();
    }, [onChange, value]);

    if (noValidation) {
        return <input
            {...(props as React.ComponentProps<'input'>)}
            disabled={pending}
            name={name}
            //@ts-ignore
            onChange={onChange}
            value={value}
            ref={ref as React.Ref<HTMLInputElement>}
        />;
    }
    else {
        const {containerClass, containerStyle, className, style, ...props2} = props as Props<false, Type>,
              props3 = getProps(name);
        return <Input2
            {...props2}
            {...props3}
            disabled={pending}
            //@ts-ignore
            onChange={onChange}
            rules={props2.rules ?? props3.rules}
            style={{
                $cover: {
                    $class: containerClass,
                    $style: containerStyle,
                },
                $input: {
                    $class: className,
                    $style: style,
                }
            }}
            value={value}
            ref={($ref: InpRef<Type> | null) => {
                setRef(ref as React.Ref<InpRef<Type>>, $ref);
                inpRef.current = $ref;
            }}
        />;
    }
}) as (
    <Type extends string, NoValidation extends (boolean | undefined) = false>(
        props: Props<NoValidation, Type> & {ref?: Ref<NoValidation, Type>, key?: React.Key | null}
    ) => React.ReactNode
);
export default SubmittedInput;