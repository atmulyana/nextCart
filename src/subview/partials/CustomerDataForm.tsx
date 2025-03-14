/** 
 * https://github.com/atmulyana/nextCart
 **/
import React from 'react';
import {countries} from 'countries-list';
import type {TCustomer, TSessionCustomer} from '@/data/types';
import lang from '@/data/lang';
import Input from '@/subview/components/SubmittedInput';
import Select from '@/subview/components/SubmittedSelect';

export default function CustomerDataForm({data}: {data?: (Partial<Omit<TSessionCustomer, '_id'>> & Partial<TCustomer>) | null}) {
    return <div className='flex flex-wrap -mx-4'>
        <div className='basis-full grow-0 shrink-0 mb-4 px-4'>
            <Input name='email' placeholder={lang('Email address')} value={data?.customerEmail ?? data?.email ?? ''} /> 
        </div>
        <div className='basis-full grow-0 shrink-0 mb-4 px-4'>
            <Input name='company' placeholder={lang('Company name')} value={data?.customerCompany ?? data?.company ?? ''} /> 
        </div>
        <div className='basis-full md:basis-1/2 grow-0 shrink-0 mb-4 px-4'>
            <Input name='firstName' placeholder={lang('First name')} value={data?.customerFirstname ?? data?.firstName ?? ''} /> 
        </div>
        <div className='basis-full md:basis-1/2 grow-0 shrink-0 mb-4 px-4'>
            <Input name='lastName' placeholder={lang('Last name')} value={data?.customerLastname ?? data?.lastName ?? ''} /> 
        </div>
        <div className='basis-full grow-0 shrink-0 mb-4 px-4'>
            <Input name='address1' placeholder={lang('Address 1')} value={data?.customerAddress1 ?? data?.address1 ?? ''}  /> 
        </div>
        <div className='basis-full grow-0 shrink-0 mb-4 px-4'>
            <Input name='address2' placeholder={`${lang("Address 2")} (${lang("optional")})`} value={data?.customerAddress2 ?? data?.address2 ?? ''} /> 
        </div>
        <div className='basis-full grow-0 shrink-0 mb-4 px-4'>
            <Select name='country' value={data?.customerCountry ?? data?.country ?? ''}>
                <option key={-1} value="" disabled>{lang('Select Country')}</option>
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
            <Input name='state' placeholder={lang('State')} value={data?.customerState ?? data?.state ?? ''} /> 
        </div>
        <div className='basis-full md:basis-1/2 grow-0 shrink-0 mb-4 px-4'>
            <Input name='postcode' placeholder={lang('Post code')} value={data?.customerPostcode ?? data?.postcode ?? ''} /> 
        </div>
        <div className='basis-full grow-0 shrink-0 mb-4 px-4'>
            <Input name='phone' placeholder={lang("Phone number")} value={data?.customerPhone ?? data?.phone ?? ''} /> 
        </div>
    </div>;
}