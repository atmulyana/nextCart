'use client';
/** 
 * https://github.com/atmulyana/nextCart
 **/
import React from 'react';
import {noChange} from 'javascript-common';
import Icon from '@/components/Icon';
import {useModal} from '@/components/Modal';
import Button from '@/components/SubmitButton';

export default function DeleteButton({
    className,
    children = <Icon name='trash-2' />,
    disabled,
    form,
    preprocess,
    question,
    title = 'Delete',
}: {
    className?: string,
    children?: React.ReactNode,
    disabled?: boolean,
    form?: string,
    preprocess?: (ok: boolean) => boolean | Promise<boolean>,
    question: string,
    title?: string,
}) {
    if (typeof(children) != 'string' && className === undefined) className = 'border-none h-auto p-0 bg-transparent';
    const btnRef = React.useRef<HTMLButtonElement>(null);
    const openConfirm = useModal();
    return <Button
        ref={btnRef}
        type='button'
        className={className}
        disabled={disabled}
        form={form}
        title={title}
        onClick={async () => {
            await openConfirm({
                title: '',
                content: <div className='pt-9'>{question}</div>,
            }).then(preprocess ?? noChange)
            .then(ok =>  {
                if (!ok) return false;
                if (form) {
                    (document.getElementById(form) as HTMLFormElement)?.requestSubmit();
                }
                else {
                    //(ev.currentTarget as HTMLButtonElement).form?.requestSubmit(); //`currentTarget` is `null` (tested on Safari)
                    btnRef.current?.form?.requestSubmit();
                }
                return true;
            });
        }}
    >
        {children}
    </Button>
} 