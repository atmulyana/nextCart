'use client';
/** 
 * https://github.com/atmulyana/nextCart
 **/
import React, { CSSProperties } from 'react';
import {useFormStatus} from "react-dom";
import {type InputRef, type StyleProp, ValidatedInput as Wrapper} from '@react-input-validator/web';
import {useSchemaProps} from '@/components/SchemaContext';
import Input from '@/components/SubmittedInput';

type Props = Omit<
    React.ComponentProps<typeof Input<string, false>>,
    'Component' | 'children' | 'key'
> & {
    append?: React.ReactElement<any>,
    containerClass?: string,
    prepend?: React.ReactElement<any>,
};

const ValidatedInput = React.forwardRef(function ValidatedInput(
    {className, containerClass, name, rules, settings, style, ...props}: Props,
    ref: React.Ref<HTMLInputElement & InputRef>
) {
    const getProps = useSchemaProps();
    const props2 = getProps(name);
    return <Wrapper
        {...props2}
        {...props}
        ref={ref}
        rules={rules ?? props2.rules}
        settings={settings}
        style={{
            $cover: containerClass,
            $input: {
                $class: className,
                $style: style,
            }
        }}
        Component={CompositeInput}
    />;
});
ValidatedInput.displayName = 'ValidatedInput';

const CompositeInput = React.forwardRef(function CompositeInput(
    {
        append,
        className,
        prepend,
        style,
        ...props
    }: Omit<Props, 'style'> & {style?: StyleProp},
    ref: React.Ref<HTMLInputElement>
) {
    const {pending} = useFormStatus();
    return <div className='flex flex-wrap items-stretch'>
        {prepend}
        <input
            {...props}
            ref={ref}
            className={`relative flex-1 min-w-0 ${className}`}
            disabled={pending}
            style={style as CSSProperties}
        />
        {append}
    </div>;
});
CompositeInput.displayName = 'CompositeInput';

export default ValidatedInput;