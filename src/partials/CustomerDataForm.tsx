/** 
 * https://github.com/atmulyana/nextCart
 **/
import React from 'react';
import {countries} from 'countries-list';
import lang from '@/data/lang';
import Input from '@/components/SubmittedInput';
import Select from '@/components/SubmittedSelect';
import TextArea from '@/components/SubmittedTextArea';

export default function CustomerDataForm() {
    return <div className='flex flex-wrap -mx-4'>
        <div className='basis-full grow-0 shrink-0 mb-4 px-4'>
            <Input name='shipEmail' placeholder={lang('Email address')} /> 
        </div>
        <div className='basis-full grow-0 shrink-0 mb-4 px-4'>
            <Input name='shipCompany' placeholder={lang('Company name')} /> 
        </div>
        <div className='basis-full md:basis-1/2 grow-0 shrink-0 mb-4 px-4'>
            <Input name='shipFirstname' placeholder={lang('First name')} /> 
        </div>
        <div className='basis-full md:basis-1/2 grow-0 shrink-0 mb-4 px-4'>
            <Input name='shipLastname' placeholder={lang('Last name')} /> 
        </div>
        <div className='basis-full grow-0 shrink-0 mb-4 px-4'>
            <Input name='shipAddr1' placeholder={lang('Address 1')} /> 
        </div>
        <div className='basis-full grow-0 shrink-0 mb-4 px-4'>
            <Input name='shipAddr2' placeholder={`${lang("Address 2")} (${lang("optional")})`} /> 
        </div>
        <div className='basis-full grow-0 shrink-0 mb-4 px-4'>
            <Select name='shipCountry'>
                <option key={-1} value="" disabled>{lang('Select Country')}</option>
                {Object.values(countries).map((item, idx) => <option key={idx} value={item.name}>{item.name}</option>)}
            </Select> 
        </div>
        <div className='basis-full md:basis-1/2 grow-0 shrink-0 mb-4 px-4'>
            <Input name='shipState' placeholder={lang('State')} /> 
        </div>
        <div className='basis-full md:basis-1/2 grow-0 shrink-0 mb-4 px-4'>
            <Input name='shipPostcode' placeholder={lang('Post code')} /> 
        </div>
        <div className='basis-full grow-0 shrink-0 mb-4 px-4'>
            <Input name='shipPhoneNumber' placeholder={lang("Phone number")} /> 
        </div>
        <div className='basis-full grow-0 shrink-0 mb-4 px-4'>
            <TextArea name='orderComment' placeholder={lang("Order comment")}></TextArea> 
        </div>
    </div>;
}