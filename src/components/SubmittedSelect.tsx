'use client';
/** 
 * https://github.com/atmulyana/nextCart
 **/
import React, { CSSProperties } from 'react';
import {Select, type Rules, type SelectProps} from '@react-input-validator/web';
import {useFormStatus} from "react-dom";
import {useSchemaProps} from './SchemaContext';

type Props<NoValidation extends (boolean | undefined), Multiple extends (boolean | undefined)> = Omit<
    {
        noValidation?: NoValidation,
        multiple?: Multiple,
        value?: SelectProps<Multiple>['value'],
    } & (
        NoValidation extends true
            ? Omit<React.ComponentProps<'select'>, 'multiple' | 'value'>
            : Omit<SelectProps<Multiple>, 'rules' | 'style'> & {
                containerClass?: string,
                containerStyle?: CSSProperties,
                className?: string,
                rules?: Rules,
                style?: CSSProperties
            }
    ),
    'disabled' | 'ref'
>;
type SelectRef<Multiple extends (boolean | undefined)> = NonNullable<React.ComponentProps<typeof Select<Multiple>>['ref']>;
type Ref<NoValidation extends (boolean | undefined), Multiple extends (boolean | undefined)> = NoValidation extends true
    ? React.Ref<HTMLSelectElement> : SelectRef<Multiple>;

const SubmittedSelect = React.forwardRef(function SubmittedSelect<
    NoValidation extends boolean | undefined = false,
    Multiple extends boolean | undefined = false,
>(
    {
        children,
        name,
        noValidation,
        ...props
    }: Props<NoValidation, Multiple>,
    ref: Ref<NoValidation, Multiple>
) {
    const {pending} = useFormStatus();
    const getProps = useSchemaProps();
    const Select2 = Select as typeof Select<Multiple>;

    if (noValidation) {
        return <select
            {...(props as React.ComponentProps<'select'>)}
            disabled={pending}
            name={name}
            ref={ref as React.Ref<HTMLSelectElement>}
        >{children}</select>;
    }
    else {
        const {containerClass, containerStyle, className, style, ...props2} = props as Props<false, Multiple>,
              props3 = getProps(name);
        return <Select2
            {...props2}
            {...props3}
            disabled={pending}
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
            ref={ref as SelectRef<Multiple>}
        >{children}</Select2>;
    }
}) as (
    <
        NoValidation extends (boolean | undefined) = false,
        Multiple extends boolean | undefined = false,
    >(
        props: Props<NoValidation, Multiple> & {ref?: Ref<NoValidation, Multiple>, key?: React.Key | null}
    ) => React.ReactNode
);
export default SubmittedSelect;