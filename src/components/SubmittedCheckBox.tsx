'use client';
/** 
 * https://github.com/atmulyana/nextCart
 **/
import React, {type CSSProperties} from 'react';
import {CheckBox, type CheckBoxProps, type CheckBoxRef} from '@react-input-validator/web';
import {useFormStatus} from "react-dom";
import {useSchemaProps} from './SchemaContext';

type Props<NoIndeterminate extends (boolean | undefined)> = Omit<
    CheckBoxProps<NoIndeterminate>,
    'className' | 'disabled' | 'style'
> & {
    containerClass?: string,
    containerStyle?: CSSProperties,
    className?: string,
    style?: CSSProperties,
};

const SubmittedCheckBox = React.forwardRef(function SubmittedCheckBox<NoIndeterminate extends boolean = false>(
    {containerClass, containerStyle, className, name, style, ...props}: Props<NoIndeterminate>,
    ref: React.Ref<CheckBoxRef<NoIndeterminate>>
) {
    const {pending} = useFormStatus();
    const getProps = useSchemaProps();
    const props2 = getProps(name);
    return <CheckBox
        {...props}
        {...props2}
        ref={ref}
        disabled={pending}
        rules={props.rules ?? props2.rules}
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
    />
}) as (
    <NoIndeterminate extends (boolean | undefined) = false>(
        props: Props<NoIndeterminate> & React.RefAttributes<CheckBoxRef<NonNullable<NoIndeterminate>>>
    ) => React.ReactNode
);
export default SubmittedCheckBox;