'use client';
/** 
 * https://github.com/atmulyana/nextCart
 **/
import React from 'react';
import {createInput} from '@react-packages/keywords';
import {setRef} from 'reactjs-common';
import type {InputRef, SelectProps} from '@react-input-validator/web';
import Select from './SubmittedSelect';

type BaseProps<NoValidation extends (boolean | undefined)> = {
    name?: string,
    noValidation?: NoValidation,
    onChange?: (newValue: string[]) => any,
    value?: string[],
    settings?: undefined,
    rules?: undefined,
};
type ValidationProps = {
    settings?: SelectProps['settings'],
    rules?: SelectProps['rules'],
};
type Props<NoValidation extends (boolean | undefined)> = NoValidation extends true 
    ? BaseProps<NoValidation>
    : BaseProps<NoValidation> & ValidationProps


const Input = React.forwardRef(function Input<NoValidation extends (boolean | undefined)>(
    {
        name,
        noValidation,
        rules,
        settings,
        value,
    }: Props<NoValidation>,
    ref: React.Ref<InputRef>
) {
    return <Select
        ref={($ref: any | null) => setRef(ref, $ref)} 
        className='hidden'
        multiple
        name={name}
        noValidation={noValidation}
        //@ts-expect-error
        settings={settings}
        rules={rules}
        value={value}
    >
        {value?.map(word => <option key={word} value={word} />)}
    </Select>
});

const Keywords = createInput<InputRef, Props<boolean>>({
    //@ts-expect-error
    Input,
    styles: {
        buzzedItemBox: {
            className: 'animate-ping !border-yellow-500',
        },
        close: {
            className: 'ml-1.5 font-extrabold outline-0 !no-underline',
        },
        container: {
            className: `flex flex-wrap gap-1 w-full h-auto py-1.5 px-3 text-base
            border border-solid rounded-sm border-[var(--input-border-color)]
            bg-clip-border bg-[var(--bg-color)] text-[var(--input-text-color)]`,
        },
        itemsBox: {
            className: `flex flex-none border-solid border-2 border-gray-200 dark:border-gray-800 rounded-sm
            bg-gray-200 dark:bg-gray-800 has-focus:border-blue-500 px-1 py-0.5 h-auto leading-none cursor-default`,
        },
        inputText: {
            className: `block flex-1 border-solid border-2 border-transparent rounded-sm 
            outline-0 leading-none bg-transparent bg-clip-border h-auto p-0.5 min-w-9`,
        },
        word: {
            className: 'cursor-default',
        }
    }
});

export default Keywords;