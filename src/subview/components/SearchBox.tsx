'use client';
/** 
 * https://github.com/atmulyana/nextCart
 **/
import React from 'react';
import {usePathname, useRouter} from 'next/navigation';
import Icon from '@/subview/components/Icon';

export default function SearchBox({
    url,
    description,
    filterSegment = 'filter',
    filterText = 'Filter',
}: {
    url: string | {
        getSearchValue: (path: string) => string,
        search: (searchVal: string) => void,
    },
    description?: string,
    filterSegment?: string,
    filterText?: string,
}) {
    const router = useRouter();
    const path = usePathname();
    const handlers: Exclude<typeof url, string> = typeof(url) == 'object' ? url : {
        getSearchValue: (path: string) => {
            const filterUrl = `${url.trim().replace(/\/+$/, '')}/${filterSegment}/`;
            let searchVal = '';
            if (path.startsWith(filterUrl)) {
                searchVal = decodeURIComponent( path.substring(filterUrl.length).split('/')[0] );
            }
            return searchVal;
        },
        search: (searchVal: string) => {
            const newPath = searchVal ? (`${url.trim().replace(/\/+$/, '')}/${filterSegment}/${encodeURIComponent(searchVal)}`) : url;
            if (newPath != path) router.push(newPath);
            else router.refresh();
        },
    };

    return <div>
        <div className='flex flex-wrap items-stretch'>
            <input type='text' defaultValue={handlers.getSearchValue(path)} className='flex-1 !rounded-r-none'
                onKeyDown={ev => {
                    if (ev.key == 'Enter') (ev.currentTarget.nextSibling as HTMLButtonElement).click();
                }}
            />
            <button type='button' className='-ml-px btn-outline-success rounded-none'
                onClick={ev => {
                    const searchVal = (ev.currentTarget.previousSibling as HTMLInputElement).value.trim();
                    handlers.search(searchVal);
                }}
            >{filterText}</button>
            <button type='button' className='-ml-px btn-outline-warning rounded-l-none'
                onClick={() => {
                    if (path != url) handlers.search('');
                }}
            >
                <Icon name="x-octagon" />
            </button>
        </div>
        {description && <span className='text-gray-500 mb-4'>{description}</span>}
    </div>;
}