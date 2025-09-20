'use client';
/** 
 * https://github.com/atmulyana/nextCart
 **/
import React, {type CSSProperties} from 'react';
import {emptyString} from 'javascript-common';
import {CheckBoxes, type CheckBoxesProps, type CheckBoxesRef, type Rules} from '@react-input-validator/web';
//import {useFormStatus} from "react-dom";
import {useSchemaProps} from './SchemaContext';

type Props = Omit<
    CheckBoxesProps,
    'disabled' | 'rules' | 'style'
> & {
    className?: string,
    rules?: Rules,
    style?: CSSProperties,
};

const SubmittedCheckBoxes = React.forwardRef(function SubmittedCheckBox(
    {className, name, style, ...props}: Props,
    ref: React.Ref<CheckBoxesRef>
) {
    //const {pending} = useFormStatus();
    const getProps = useSchemaProps();
    const props2 = getProps(name);
    return <CheckBoxes
        {...props}
        {...props2}
        ref={ref}
        //disabled={pending}
        rules={props.rules ?? props2.rules}
        style={{
            $class: `checkboxes${className ? ' ' + className : emptyString}`,
            $style: style,
        }}
    />
});
export default SubmittedCheckBoxes;