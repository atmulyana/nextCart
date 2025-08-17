/** 
 * https://github.com/atmulyana/nextCart
 **/
import React from 'react';
import {countries} from 'countries-list';
import {emptyString, noChange} from 'javascript-common';
import type {TCustomer, TSessionCustomer} from '@/data/types';
import _lang from '@/data/lang';
import Input from '@/components/SubmittedInput';
import Select from '@/components/SubmittedSelect';
import ValidatedInput from '@/components/ValidatedInput';

const lang = _lang ?? noChange;

export default function CustomerDataForm({
    data,
    emailAppend,
    texts,
}: {
    data?: (Partial<Omit<TSessionCustomer, '_id'>> & Partial<TCustomer>) | null,
    emailAppend?: React.ReactElement<any>,
    texts?: {
        address1: string,
        address2: string,
        company: string,
        email: string,
        firstName: string,
        lastName: string,
        state: string,
        optional: string,
        phone: string,
        postcode: string,
        selectCountry: string,
    }
}) {
    return <div className='flex flex-wrap -mx-4'>
        <div className='basis-full grow-0 shrink-0 mb-4 px-4'>
            <ValidatedInput 
                append={emailAppend}
                className={emailAppend ? 'rounded-r-none -mr-0.5' : undefined}
                id='customerEmail'
                name='email'
                placeholder={texts?.email ?? lang('Email address')}
                value={data?.customerEmail ?? data?.email ?? emptyString}
            /> 
        </div>
        <div className='basis-full grow-0 shrink-0 mb-4 px-4'>
            <Input
                name='company'
                placeholder={texts?.company ?? lang('Company name')}
                value={data?.customerCompany ?? data?.company ?? emptyString}
            /> 
        </div>
        <div className='basis-full md:basis-1/2 grow-0 shrink-0 mb-4 px-4'>
            <Input
                name='firstName'
                placeholder={texts?.firstName ?? lang('First name')}
                value={data?.customerFirstname ?? data?.firstName ?? emptyString}
            /> 
        </div>
        <div className='basis-full md:basis-1/2 grow-0 shrink-0 mb-4 px-4'>
            <Input
                name='lastName'
                placeholder={texts?.lastName ?? lang('Last name')}
                value={data?.customerLastname ?? data?.lastName ?? emptyString}
            /> 
        </div>
        <div className='basis-full grow-0 shrink-0 mb-4 px-4'>
            <Input
                name='address1'
                placeholder={texts?.address1 ?? lang('Address 1')}
                value={data?.customerAddress1 ?? data?.address1 ?? emptyString}
            /> 
        </div>
        <div className='basis-full grow-0 shrink-0 mb-4 px-4'>
            <Input
                name='address2'
                placeholder={`${texts?.address2 ?? lang("Address 2")} (${texts?.optional ?? lang("optional")})`}
                value={data?.customerAddress2 ?? data?.address2 ?? emptyString}
            /> 
        </div>
        <div className='basis-full grow-0 shrink-0 mb-4 px-4'>
            <Select name='country' value={data?.customerCountry ?? data?.country ?? emptyString}>
                <option key={-1} value={emptyString} disabled>{texts?.selectCountry ?? lang('Select Country')}</option>
                {Object.values(countries)
                    .sort(
                        (a, b,) => a.name < b.name ? -1 :
                                   a.name > b.name ? 1 :
                                   0
                    )
                    .map(
                        (item, idx) => <option key={idx} value={item.name}>{item.name}</option>
                    )
                }
            </Select> 
        </div>
        <div className='basis-full md:basis-1/2 grow-0 shrink-0 mb-4 px-4'>
            <Input
                name='state'
                placeholder={texts?.state ?? lang('State')}
                value={data?.customerState ?? data?.state ?? emptyString}
            /> 
        </div>
        <div className='basis-full md:basis-1/2 grow-0 shrink-0 mb-4 px-4'>
            <Input
                name='postcode'
                placeholder={texts?.postcode ?? lang('Post code')}
                value={data?.customerPostcode ?? data?.postcode ?? emptyString}
            /> 
        </div>
        <div className='basis-full grow-0 shrink-0 mb-4 px-4'>
            <Input
                name='phone'
                placeholder={texts?.phone ?? lang("Phone number")}
                value={data?.customerPhone ?? data?.phone ?? emptyString}
            /> 
        </div>
    </div>;
}