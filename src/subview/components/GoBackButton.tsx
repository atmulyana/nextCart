'use client';
/** 
 * https://github.com/atmulyana/nextCart
 **/
import React from 'react';
import {useRouter} from 'next/navigation';
import Button from '@/subview/components/SubmitButton';

export default function DeleteButton({backUrl, className, label = 'Go Back'}: {backUrl?: string, className?: string, label?: string}) {
    const router = useRouter();
    return <Button
        type='button'
        className={`btn-outline-primary ${className??''}`}
        onClick={async () => {
            if (backUrl) router.push(backUrl);
            else router.back();
        }}
    >
        {label}
    </Button>
} 