'use client';
/** 
 * https://github.com/atmulyana/nextCart
 **/
import React from 'react';
import {noop} from 'javascript-common';
import {createPortal} from 'react-dom';
import Form, {useFormContext} from '@/components/Form';
import DeleteButton from '@/components/DeleteButton';
import {remove} from '../../actions';

export default function DeleteForm({
    id,
    deleteLabel,
    question,
}: {
    id: string,
    deleteLabel: string,
    question: string,
}) {
    const [isMounted, setMounted] = React.useState(false);
    const stopLoading = React.useRef(noop);
    const formCtx = useFormContext();
    const loadingCallback = React.useCallback((isLoading: boolean) => {
        if (!isLoading) stopLoading.current();
    }, []);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    return <>
        {isMounted && createPortal(
            <InternalForm id={id} loadingCallback={loadingCallback} />,
            document.getElementById('deleteCustomerFormContainer') as HTMLDivElement
        )}        
        <DeleteButton
            form='deleteCustomerForm'
            className='btn-outline-danger ml-4'
            question={question}
            preprocess={ok => {
                if (!ok) return false;
                return new Promise<boolean>(resolve => {
                    const ret = formCtx.showLoading?.();
                    if (!ret) {
                        resolve(true);
                        return;
                    }
                    stopLoading.current = () => {
                        ret.stop();
                        stopLoading.current = noop;
                    };
                    ret.ready(() => {
                        resolve(true);
                    });
                });
            }}
        >{deleteLabel}</DeleteButton>
    </>;
}

const InternalForm = React.memo(function InternalForm({
    id,
    loadingCallback,
}: {
    id: string,
    loadingCallback: (isLoading: boolean) => any,
}) {
    return <Form id='deleteCustomerForm' action={remove} loadingCallback={loadingCallback}>
        <input type='hidden' name='id' value={id} />
        <input type='hidden' name='redirectUrl' value='/admin/customers' />
    </Form>;
});