/** 
 * https://github.com/atmulyana/nextCart
 **/
import React from 'react';
import {countries} from 'countries-list';
import type {TSessionCustomer} from '@/data/types';
import lang from '@/data/lang';
import Input from '@/subview/components/SubmittedInput';
import Select from '@/subview/components/SubmittedSelect';

export default function CustomerDataForm({data}: {data?: TSessionCustomer | null}) {
    return <div className='flex flex-wrap -mx-4'>
        <div className='basis-full grow-0 shrink-0 mb-4 px-4'>
            <Input name='email' placeholder={lang('Email address')} value={data?.customerEmail ?? ''} /> 
        </div>
        <div className='basis-full grow-0 shrink-0 mb-4 px-4'>
            <Input name='company' placeholder={lang('Company name')} value={data?.customerCompany ?? ''} /> 
        </div>
        <div className='basis-full md:basis-1/2 grow-0 shrink-0 mb-4 px-4'>
            <Input name='firstName' placeholder={lang('First name')} value={data?.customerFirstname ?? ''} /> 
        </div>
        <div className='basis-full md:basis-1/2 grow-0 shrink-0 mb-4 px-4'>
            <Input name='lastName' placeholder={lang('Last name')} value={data?.customerLastname ?? ''} /> 
        </div>
        <div className='basis-full grow-0 shrink-0 mb-4 px-4'>
            <Input name='address1' placeholder={lang('Address 1')} value={data?.customerAddress1 ?? ''}  /> 
        </div>
        <div className='basis-full grow-0 shrink-0 mb-4 px-4'>
            <Input name='address2' placeholder={`${lang("Address 2")} (${lang("optional")})`} value={data?.customerAddress2 ?? ''} /> 
        </div>
        <div className='basis-full grow-0 shrink-0 mb-4 px-4'>
            <Select name='country' value={data?.customerCountry ?? ''}>
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
            <Input name='state' placeholder={lang('State')} value={data?.customerState ?? ''} /> 
        </div>
        <div className='basis-full md:basis-1/2 grow-0 shrink-0 mb-4 px-4'>
            <Input name='postcode' placeholder={lang('Post code')} value={data?.customerPostcode ?? ''} /> 
        </div>
        <div className='basis-full grow-0 shrink-0 mb-4 px-4'>
            <Input name='phone' placeholder={lang("Phone number")} value={data?.customerPhone ?? ''} /> 
        </div>
    </div>;
}