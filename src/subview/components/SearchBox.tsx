'use client';
/** 
 * https://github.com/atmulyana/nextCart
 **/
import React from 'react';
import {usePathname, useRouter} from 'next/navigation';
import Icon from '@/subview/components/Icon';
import Button from '@/subview/components/SubmitButton';
import Input from '@/subview/components/SubmittedInput';

export default function SearchBox({url, description, filterText = 'Filter'}: {url: string, description: string, filterText?: string}) {
    const router = useRouter();
    const searchText = React.useRef<HTMLInputElement>(null);
    const filterUrl = url.trim().replace(/\/+$/, '') + '/filter/';
    const path = usePathname();
    let searchVal = '';
    if (path.startsWith(filterUrl)) {
        searchVal = decodeURIComponent( path.substring(filterUrl.length).split('/')[0] );
    }

    return <div>
        <div className='flex flex-wrap items-stretch'>
            <Input ref={searchText} type='text' defaultValue={searchVal} className='flex-1 !rounded-r-none'
                onKeyDown={ev => {
                    if (ev.key == 'Enter') ((ev.target as HTMLInputElement).nextSibling as HTMLButtonElement).click();
                }}
            />
            <Button type='button' className='-ml-px btn-outline-success rounded-none'
                onClick={() => {
                    const searchVal = searchText.current?.value.trim();
                    const newPath = searchVal ? (filterUrl + encodeURIComponent(searchVal)) : url;
                    if (newPath != path) router.push(newPath);
                    else router.refresh();
                }}
            >{filterText}</Button>
            <Button type='button' className='-ml-px btn-outline-warning rounded-l-none'
                onClick={() => {
                    if (path != url) router.push(url);
                }}
            >
                <Icon name="x-octagon" />
            </Button>
        </div>
        <span className='text-gray-500 mb-4'>{description}</span>
    </div>;
}