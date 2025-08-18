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
    labeled,
    texts,
}: {
    data?: (Partial<Omit<TSessionCustomer, '_id'>> & Partial<TCustomer>) | null,
    emailAppend?: React.ReactElement<any>,
    labeled?: boolean,
    texts?: {
        address1: string,
        address2: string,
        company: string,
        country: string,
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
    let placeholder = emptyString, id = emptyString as string | undefined;
    const label = (text: string, inputId?: string) => {
        id = inputId;
        placeholder = emptyString;
        if (labeled) return <label htmlFor={inputId}>{text}</label>;
        placeholder = text;
        return null;
    };

    return <div className='flex flex-col items-stretch -mx-4'>
        <div className='flex flex-col mb-4 px-4'>
            {label(texts?.email ?? lang('Email address'), 'customerEmail')}
            <ValidatedInput 
                append={emailAppend}
                className={emailAppend ? 'rounded-r-none -mr-0.5' : undefined}
                id={id}
                name='email'
                placeholder={placeholder}
                value={data?.customerEmail ?? data?.email ?? emptyString}
            /> 
        </div>
        <div className='flex flex-col mb-4 px-4'>
            {label(texts?.company ?? lang('Company name'), 'customerCompany')}
            <Input
                name='company'
                id={id}
                placeholder={placeholder}
                value={data?.customerCompany ?? data?.company ?? emptyString}
            /> 
        </div>
        <div className='flex flex-wrap'>
            <div className='flex flex-col basis-full md:basis-1/2 shrink-0 mb-4 px-4'>
                {label(texts?.firstName ?? lang('First name'), 'customerFirstName')}
                <Input
                    name='firstName'
                    id={id}
                    placeholder={placeholder}
                    value={data?.customerFirstname ?? data?.firstName ?? emptyString}
                /> 
            </div>
            <div className='flex flex-col basis-full md:basis-1/2 shrink-0 mb-4 px-4'>
                {label(texts?.lastName ?? lang('Last name'), 'customerLastName')}
                <Input
                    name='lastName'
                    id={id}
                    placeholder={placeholder}
                    value={data?.customerLastname ?? data?.lastName ?? emptyString}
                /> 
            </div>
        </div>
        <div className='flex flex-col mb-4 px-4'>
            {label(texts?.address1 ?? lang('Address 1'), 'customerAddress1')}
            <Input
                name='address1'
                id={id}
                placeholder={placeholder}
                value={data?.customerAddress1 ?? data?.address1 ?? emptyString}
            /> 
        </div>
        <div className='flex flex-col mb-4 px-4'>
            {label(`${texts?.address2 ?? lang("Address 2")} (${texts?.optional ?? lang("optional")})`, 'customerAddress2')}
            <Input
                name='address2'
                id={id}
                placeholder={placeholder}
                value={data?.customerAddress2 ?? data?.address2 ?? emptyString}
            /> 
        </div>
        <div className='flex flex-col mb-4 px-4'>
            {label(texts?.country ?? lang('Country'), 'customerCountry')}
            <Select name='country' id={id} value={data?.customerCountry ?? data?.country ?? emptyString}>
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
        <div className='flex flex-wrap'>
            <div className='flex flex-col basis-full md:basis-1/2 shrink-0 mb-4 px-4'>
                {label(texts?.state ?? lang('State'), 'customerState')}
                <Input
                    name='state'
                    id={id}
                    placeholder={placeholder}
                    value={data?.customerState ?? data?.state ?? emptyString}
                /> 
            </div>
            <div className='flex flex-col basis-full md:basis-1/2 shrink-0 mb-4 px-4'>
                {label(texts?.postcode ?? lang('Post code'), 'customerPostcode')}
                <Input
                    name='postcode'
                    id={id}
                    placeholder={placeholder}
                    value={data?.customerPostcode ?? data?.postcode ?? emptyString}
                /> 
            </div>
        </div>
        <div className='flex flex-col mb-4 px-4'>
            {label(texts?.phone ?? lang("Phone number"), 'customerPhone')}
            <Input
                name='phone'
                id={id}
                placeholder={placeholder}
                value={data?.customerPhone ?? data?.phone ?? emptyString}
            /> 
        </div>
    </div>;
}