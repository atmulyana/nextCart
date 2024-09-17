'use client';
/** 
 * https://github.com/atmulyana/nextCart
 **/
import * as React from 'react';
import {useFormStatus} from "react-dom";

export default function SubmitButton({children, disabled = false, type='submit', ...props}: React.ComponentProps<'button'>) {
    const {pending} = useFormStatus();
    return <button {...props} type={type} disabled={disabled || pending}>{children}</button>;
}