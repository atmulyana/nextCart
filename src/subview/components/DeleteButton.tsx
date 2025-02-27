'use client';
/** 
 * https://github.com/atmulyana/nextCart
 **/
import React from 'react';
import Icon from '@/subview/components/Icon';
import {useModal} from '@/subview/components/Modal';
import Button from '@/subview/components/SubmitButton';

export default function DeleteButton({
    className,
    children = <Icon name='trash-2' />,
    question,
}: {
    className?: string,
    children?: React.ReactNode,
    question: string,
}) {
    if (typeof(children) != 'string' && className === undefined) className = 'border-none h-auto p-0 bg-transparent';
    const btnRef = React.useRef<HTMLButtonElement>(null);
    const openConfirm = useModal();
    return <Button
        ref={btnRef}
        type='button'
        className={className}
        onClick={async (ev) => {
            if (await openConfirm({
                title: '',
                content: <div className='pt-9'>{question}</div>,
            })) {
                //(ev.currentTarget as HTMLButtonElement).form?.requestSubmit(); //`currentTarget` is `null` (tested on Safari)
                btnRef.current?.form?.requestSubmit();
            }
            else {
                ev.preventDefault();
            }
        }}
    >
        {children}
    </Button>
} 