'use client';
/** 
 * https://github.com/atmulyana/nextCart
 **/
import React from 'react';
import CheckBoxes from '@/components/SubmittedCheckBoxes';
import Input from '@/components/SubmittedInput';
import Select from '@/components/SubmittedSelect';

export default function PaymentPartial({
    currencyISO,
    currencySymbol,
    gatewayOptions,
    seletedGateways,
    texts,
}: {
    currencyISO: string,
    currencySymbol: string,
    gatewayOptions: Array<{value: string, label: string}>,
    seletedGateways: string[],
    texts: {
        currencyISO: string,
        currencyISODesc: string,
        currencySymbol: string,
        currencySymbolDesc: string,
        method: string,
    },
}) {
    const [gateways, setGateways] = React.useState<readonly string[]>(seletedGateways);

    React.useEffect(() => {
        setGateways(seletedGateways);
    }, [seletedGateways]);
    return <>
        <div className='flex flex-wrap -mx-2'>
            <div className='flex flex-col basis-full sm:basis-1/2 shrink-0 px-2 mb-4'>
                <label htmlFor='settings.currencySymbol'>{texts.currencySymbol}</label>
                <Input name='currencySymbol' id='settings.currencySymbol' type='text' value={currencySymbol} />
                <div className='text-gray-500'>{texts.currencySymbolDesc}</div>
            </div>

            {gateways.includes('blockonomics') &&
            <div className='flex flex-col basis-full sm:basis-1/2 shrink-0 px-2 mb-4'>
                <label htmlFor='settings.currencyISO'>{texts.currencyISO}</label>
                <Select name='currencyISO' id='settings.currencyISO' value={currencyISO}>
                    <option value='USD'>USD</option>
                    <option value='EUR'>EUR</option>
                    <option value='GBP'>GBP</option>
                </Select>
                <div className='text-gray-500'>{texts.currencyISODesc}</div>
            </div>}
        </div>
        <div className='flex flex-col mb-4'>
            <label>{texts.method}</label>
            <CheckBoxes
                name='paymentGateway'
                onChange={ev => {
                    setGateways(ev.target.value)
                }}
                options={gatewayOptions}
                value={gateways}
            />
        </div>
    </>;
}