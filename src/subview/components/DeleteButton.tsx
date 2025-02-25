'use client';
/** 
 * https://github.com/atmulyana/nextCart
 **/
import React from 'react';
import Icon from '@/subview/components/Icon';
import {useModal} from '@/subview/components/Modal';
import Button from '@/subview/components/SubmitButton';

export default function DeleteButton({question}: {question: string}) {
    const btnRef = React.useRef<HTMLButtonElement>(null);
    const openConfirm = useModal();
    return <Button
        ref={btnRef}
        type='button'
        className='border-none h-auto p-0 bg-transparent'
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
        <Icon name='trash-2' />
    </Button>
} 