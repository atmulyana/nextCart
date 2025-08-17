'use client';
/** 
 * https://github.com/atmulyana/nextCart
 **/
import React from 'react';
import {emptyString} from 'javascript-common';
import Button from '@/components/SubmitButton';
import Loading from '@/components/Loading';
import {useNotification} from '@/components/Notification';
import {useFormContext} from '@/components/Form';
import CustomerDataForm from '@/components/partials/CustomerDataForm';
import type {TCustomer} from '@/data/types';
import {isPlainObject} from '@/lib/common';
import {getCustomer} from '../actions';

export default function CustomerData({texts}: {
    texts: {
        address1: string,
        address2: string,
        company: string,
        email: string,
        find: string,
        firstName: string,
        lastName: string,
        state: string,
        optional: string,
        phone: string,
        postcode: string,
        selectCountry: string,
    }
}) {
    const [data, setData] = React.useState<TCustomer | null>(null);
    const [loading, setLoading] = React.useState(false);
    const notify = useNotification();
    const formCtx = useFormContext();

    React.useEffect(() => {
        if (loading) {
            const inpRef = formCtx.validation?.getInput('email');
            if (inpRef?.validate()) {
                getCustomer(inpRef.getValue()).then(res => {
                    if (isPlainObject(res)) {
                        if ('message' in res) notify(res.message, res.messageType);
                        if (res.messageType == 'success') setData(res.data);
                    }
                }).finally(() => {
                    setLoading(false);
                });
            }
            else {
                setLoading(false);
            }
        }
    }, [loading]);

    return <>
        <input type='hidden' name='customerId' value={data?._id.toString() ?? emptyString} />
        <CustomerDataForm data={data} texts={texts}
            emailAppend={<Button type='button'
                className='btn-outline-success relative rounded-l-none z-[1]'
                disabled={loading}
                onClick={() => setLoading(true)}
            >
                {texts.find}
                <Loading isLoading={loading} noBackdrop />
            </Button>}
        />
    </>;
}