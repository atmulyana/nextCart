'use client';
/** 
 * https://github.com/atmulyana/nextCart
 **/
import React from 'react';
import {useFormStatus} from "react-dom";
import {emptyString} from 'javascript-common';
import {length, required, ruleAsync} from '@react-input-validator/rules';
import {getStyleProps, type InputRef, type Rules} from '@react-input-validator/web';
import Loading from '@/components/Loading';
import ValidatedInput from '@/components/ValidatedInput';
import {validatePermalink} from './actions';

export default function PermalinkInput({
    placeholder,
    validateLabel,
}: {
    placeholder: string,
    validateLabel: string,
}) {
    const ref = React.useRef<HTMLInputElement & InputRef>(null);
    const successMessage = React.useRef(emptyString);
    const [rules, setRules] = React.useState<Rules | undefined>(void(0));
    const {pending} = useFormStatus();
    const loading = !!rules || pending;

    React.useEffect(() => {
        if (rules) {
            if (pending) setRules(void(0));
            else {
                ref.current?.validateAsync()
                    .finally(() => setRules(void(0)));
            }
        }
    }, [rules]);

    return <ValidatedInput ref={ref} rules={rules} type='text' 
        id='productPermalink' name='permalink' placeholder={placeholder}
        className='z-0 rounded-r-none'
        settings={{
            setStatusStyle: (props, style, context) => {
                if (style) { //invalid status after validate or re-render when invalid
                    Object.assign(props, getStyleProps(context.normalStyle, ...style));
                }
                else if (style === null) {  //valid status after `validate` action
                    if (successMessage.current) {
                        Object.assign(props, getStyleProps(context.normalStyle, 'border-[var(--color-success)] text-[var(--color-success)]'));
                        context.flag = 1;
                        const message = successMessage.current;
                        successMessage.current = emptyString;
                        return <span {...getStyleProps(context.normalStyle, 'text-[var(--color-success)]')}>{message}</span>;
                    }
                }
                else { //clear action or re-rendering when valid
                    if (style === false) {  // re-rendering such as because of editing value
                        if (context.flag === 1) { //It's set above when valid after `validate` action
                            context.clearValidation();
                        }
                    }
                    else { //after `clearValidation`
                        context.flag = 0;
                    }
                            
                    if (context.flag === 0) { //`0` is initial flag
                        Object.assign(props, getStyleProps(context.normalStyle));
                    }
                    else {
                        Object.assign(props, getStyleProps(context.normalStyle, 'border-[var(--color-success)] text-[var(--color-success)]'));
                    }
                }
                return null;
            }
        }}
        append={
            <button type='button' disabled={loading}
                className='relative flex-none z-[1] btn-outline-primary rounded-l-none -ml-px'
                onClick={() => setRules([
                    required,
                    length(2),
                    ruleAsync((value, resolve) => {
                        const productId = (document.getElementById('id') as (HTMLInputElement | null))?.value;
                        validatePermalink(value, productId).then(({success, message}) => {
                            if (success) {
                                successMessage.current = message;
                                resolve(true);
                            }
                            else {
                                resolve(message);
                            }
                        });
                    })
                ])}
            >
                {validateLabel}
                <Loading isLoading={loading} noBackdrop />
            </button>
        }
    />
}