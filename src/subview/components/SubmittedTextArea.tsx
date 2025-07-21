'use client';
/** 
 * https://github.com/atmulyana/nextCart
 **/
import React, { CSSProperties } from 'react';
import {TextArea, type Rules, type TextAreaProps} from '@react-input-validator/web';
import {useFormStatus} from "react-dom";
import {useSchemaProps} from './SchemaContext';

type Props<NoValidation extends (boolean | undefined)> = Omit<
    {
        noValidation?: NoValidation
    } & (
        NoValidation extends true
            ? React.ComponentProps<'textarea'>
            : Omit<TextAreaProps, 'rules' | 'style'> & {className?: string, rules?: Rules, style?: CSSProperties}
    ),
    'disabled' | 'ref'
>;
type TextAreaRef = NonNullable<React.ComponentProps<typeof TextArea>['ref']>;
type Ref<NoValidation extends (boolean | undefined)> = NoValidation extends true ? React.Ref<HTMLTextAreaElement> : TextAreaRef;

const SubmittedTextArea = React.forwardRef(function SubmittedTextArea<NoValidation extends boolean | undefined = false>(
    {
        name,
        noValidation,
        ...props
    }: Props<NoValidation>,
    ref: Ref<NoValidation>
) {
    const {pending} = useFormStatus();
    const getProps = useSchemaProps();

    if (noValidation) {
        return <textarea
            {...(props as React.ComponentProps<'textarea'>)}
            disabled={pending}
            name={name}
            ref={ref as React.Ref<HTMLTextAreaElement>}
        />;
    }
    else {
        const {className, style, ...props2} = props as Props<false>,
              props3 = getProps(name);
        return <TextArea
            {...props2}
            {...props3}
            disabled={pending}
            rules={props2.rules ?? props3.rules}
            style={{
                $class: className,
                $style: style,
            }}
            ref={ref as TextAreaRef}
        />;
    }
}) as (
    <NoValidation extends (boolean | undefined) = false>(
        props: Props<NoValidation> & {ref?: Ref<NoValidation>, key?: React.Key}
    ) => React.ReactNode
);
export default SubmittedTextArea;