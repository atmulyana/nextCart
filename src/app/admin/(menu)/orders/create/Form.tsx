'use client';
/** 
 * https://github.com/atmulyana/nextCart
 **/
import React from 'react';
import {createPortal} from 'react-dom';
import Button from '@/components/SubmitButton';
import FormWithSchema from '@/components/FormWithSchema';
import {create} from '../actions';

export default function Form({
    children,
    saveLabel,
}: {
    children: React.ReactNode,
    saveLabel: string,
}) {
    const [isMounted, setMounted] = React.useState(false);
    const [loading, setLoading] = React.useState(false);
    const loadingCallback = React.useCallback((isLoading: boolean) => setLoading(isLoading), []);
    
    React.useEffect(() => {
        setMounted(true);
    }, []);

    return <>
        {isMounted && createPortal(
            <Button type='submit' className='btn-outline-success flex-none' disabled={loading} form='createOrderForm'>{saveLabel}</Button>,
            document.getElementById('createOrderButtonContainer') as HTMLDivElement
        )}
        <InternalForm 
            loadingCallback={loadingCallback}
        >
            {children}
        </InternalForm>
    </>;
}

const InternalForm = React.memo(function InternalForm({
    children,
    loadingCallback
}: {
    children: React.ReactNode,
    loadingCallback?: (isLoading: boolean) => any
}) {
    return <FormWithSchema 
        id='createOrderForm'
        action={create}
        className='block'
        loadingCallback={loadingCallback}
        schemaName='checkoutInfo'
    >
        {children}
    </FormWithSchema>;
});