'use client';
/** 
 * https://github.com/atmulyana/nextCart
 **/
import React from 'react';
import Link from 'next/link';
import JsSimpleDateFormat from 'jssimpledateformat';
import {currencySymbol, formatAmount} from '@/lib/common';
import Icon from "@/components/Icon";
import {useModal, useToCloseModal} from "@/components/Modal";
import Form from '@/components/Form';
import Button from '@/components/SubmitButton';
import Input from '@/components/SubmittedInput';
import {globalSearch} from './search-actions';

type Props = {
    customerText?: string,
    noItemText?: string,
    orderText?: string,
    productText?: string,
};

export const SearchIcon = React.memo(function SearchIcon(props: Props) {
    const openModal = useModal();
    return <a
        href='#'
        className='inline-block w-1/12 text-center text-gray-500'
        onClick={ev => {
            ev.preventDefault();
            openModal({
                title: '',
                titleClass: '',
                bodyClass: 'h-min-12 !p-0',
                okLabel: '',
                cancelLabel: '',
                position: 'top-center',
                size: '4xl',
                content: <SearchForm {...props} />,
            });
        }}
    >
        <Icon name='search' />
    </a>;
});

const SearchForm = React.memo(function SearchForm({
    customerText = 'Customer',
    noItemText = 'Nothing found',
    orderText = 'Order',
    productText = 'Product',
}: Props) {
    const closeModal = useToCloseModal();
    const [value, setValue] = React.useState('');
    
    type TData = Omit<Awaited<ReturnType<typeof globalSearch>>, 'messageType'> | null;
    const [data, setData] = React.useState<TData>(null);
    const onSubmitted = React.useCallback(({data = null, type}: {data?: TData, type: string}) => {
        if (type == 'success') setData(data);
    }, []);

    let id: string;
    let count = 0;
    const dtFormat = new JsSimpleDateFormat('yyyy/MM/dd', 'id');
    return <> 
        <Form id='global-search-form' className='relative flex items-stretch h-12'
            loading={null} action={globalSearch} onSubmitted={onSubmitted}
        >
            <Button
                className='flex-none flex items-center justify-center w-11 !h-auto !p-0 -mr-px
                         bg-gray-200 dark:bg-gray-800 rounded-l-md rounded-r-none'
                onClick={ev => {
                    if (!value.trim()) {
                        ev.preventDefault();
                        setData(null);
                    }
                }}
            >
                <Icon name='search' />
            </Button>
            <Input noValidation id='global-search-value'
                className='flex-1 !border-gray-200 dark:!border-gray-800 !rounded-l-none !rounded-r-md
                           !px-4 !py-2 !text-xl/normal !font-normal !h-auto z-10'
                name='keywords'
                value={value}
                onChange={ev => setValue(ev.target.value)}
                onKeyDown={ev => {
                    if (ev.key == 'Enter') {
                        //It's like pressing 'submit' button
                        (ev.currentTarget.previousSibling as HTMLButtonElement).click();
                        
                        //Pressing 'Enter' usually submits the form. To avoid the form is submitted twice because of 
                        //the previous statement, cancel this behavior. We don't rely on behavior of pressing "Enter"
                        //because sometimes it doesn't trigger 'submit' event.
                        ev.preventDefault();
                    }
                    else if (ev.key == 'Esc') {
                        closeModal();
                    }
                }}
            />
            <Icon
                name='x-circle'
                className={`absolute right-4 top-1/2 -translate-y-1/2 z-10${value.trim() ? '' : ' !hidden'}`}
                onClick={() => {
                    setValue('');
                    setData(null);
                }}
            />
        </Form>
        {data != null && <div id='global-search-results' className='flex flex-col bg-[var(--bg-color)] rounded-b-md overflow-hidden empty:hidden'>
            {(data.customers ?? []).map(item => (
                id = item._id.toString(),
                count++,
                <Link
                    key={id}
                    href={`/admin/customer/view/${id}`}
                    className='flex items-center border border-blurry last:rounded-b-md py-3 px-5 noline
                               hover:text-[var(--bg-color)] hover:bg-sky-600 dark:hover:bg-sky-300'
                    onClick={ev => {
                        ev.preventDefault();
                        closeModal();
                    }}
                >
                    <div className='w-1/6 flex items-center'>
                        <Icon name='user' />&nbsp;{customerText}
                    </div>
                    <div className='w-4/6'>{item.firstName} {item.lastName}</div>
                    <div className='w-1/6'>{item.email}</div>
                </Link>
            ))}
            {(data.orders ?? []).map(item => (
                id = item._id.toString(),
                count++,
                <Link
                    key={id}
                    href={`/admin/order/view/${id}`}
                    className='flex items-center border border-blurry last:rounded-b-md py-3 px-5 noline
                               hover:text-[var(--bg-color)] hover:bg-sky-600 dark:hover:bg-sky-300'
                    onClick={ev => {
                        ev.preventDefault();
                        closeModal();
                    }}
                >
                    <div className='w-1/6 flex items-center'>
                        <Icon name='package' />&nbsp;{orderText}
                    </div>
                    <div className='w-3/6'>{item.orderFirstname} {item.orderLastname}</div>
                    <div className='w-1/6'>{item.orderDate && dtFormat.format(item.orderDate)}</div>
                    <div className='w-1/6'>{item.orderEmail}</div>
                </Link>
            ))}
            {(data.products ?? []).map(item => (
                id = item._id.toString(),
                count++,
                <Link
                    key={id}
                    href={`/admin/product/edit/${id}`}
                    className='flex items-center border border-blurry last:rounded-b-md py-3 px-5 noline
                               hover:text-[var(--bg-color)] hover:bg-sky-600 dark:hover:bg-sky-300'
                    onClick={ev => {
                        ev.preventDefault();
                        closeModal();
                    }}
                >
                    <div className='w-1/6 flex items-center'>
                        <Icon name='tag' />&nbsp;{productText}
                    </div>
                    {item.variant ? <>
                        <div className='w-3/6'>{item.productTitle}</div>
                        <div className='w-1/6'>{item.variant.title}</div>
                        <div className='w-1/6 text-right'>{currencySymbol()}{formatAmount(item.variant.price)}</div>
                    </> : <>
                        <div className='w-4/6'>{item.productTitle}</div>
                        <div className='w-1/6 text-right'>{currencySymbol()}{formatAmount(item.productPrice)}</div>
                    </>}
                </Link>
            ))}
            {count < 1 && <div className='border-blurry py-3 px-5 text-center text-gray-500'>{noItemText}</div>}
        </div>}
    </>;
});