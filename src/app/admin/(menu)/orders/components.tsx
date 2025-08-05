'use client';
/** 
 * https://github.com/atmulyana/nextCart
 **/
import React from 'react';
import {usePathname, useRouter} from 'next/navigation';
import Icon from '@/components/Icon';
import GlobalPaging from '@/components/Paging';
import GlobalSearchBox from '@/components/SearchBox';

export function SearchBox({
    byStatusText = 'By status',
    description,
    filterText = 'Filter',
    statuses,
}: {
    byStatusText?: string,
    description?: string,
    filterText?: string,
    statuses: Array<{value: string, label: string}>,
}) {
    const router = useRouter();
    const path = usePathname();
    const segments = path.split('/');
    let searchVal = '', status = '';
    if (segments[3] == 'filter') {
        searchVal = decodeURIComponent(segments[4]||'');
        if (segments[5] == 'status') status = decodeURIComponent(segments[6]||'');
        else if (segments[6] == 'status') status = decodeURIComponent(segments[7]||'');
    }
    else if (segments[segments.length - 2] == 'status') {
        status = decodeURIComponent(segments[segments.length-1]||'');
    }

    const handlers = {
        getSearchValue: () => searchVal,
        search: (searchValue: string = searchVal, statusValue: string = status) => {
            let newPath = '/admin/orders';
            if (searchValue) newPath += '/filter/' + encodeURIComponent(searchValue);
            if (statusValue) newPath += '/status/' + encodeURIComponent(statusValue);

            if (newPath != path) router.push(newPath);
            else router.refresh();
        },
    }
    
    return <div>
        <GlobalSearchBox url={handlers} filterText={filterText} />
        <div className='flex justify-end mb-4'>
            {description && <span className='flex-1 self-start text-gray-500'>{description}</span>}
            <div className='flex justify-end items-stretch mt-2'>
                <select defaultValue={status} className='w-auto rounded-r-none'>
                    {statuses.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
                <button
                    type='button'
                    className='-ml-px btn-outline-primary rounded-none'
                    onClick={ev => {
                        const status = (ev.currentTarget.previousSibling as HTMLSelectElement).value;
                        handlers.search(undefined, status);
                    }}
                >{byStatusText}</button>
                <button type='button' className='-ml-px btn-outline-warning rounded-l-none' onClick={() => handlers.search(undefined, '')}>
                    <Icon name="x-octagon" />
                </button>
            </div>
        </div>
    </div>;
}

export function Paging({pageCount, selectedPage}: {pageCount: number, selectedPage: number}) {
    const path = usePathname();
    const dirSegments = React.useMemo(() => path.split('/'), [path]);
    const getHref = React.useCallback((page: number) => {
        if (dirSegments[3] == 'filter') {
            if (dirSegments[5] == 'status') dirSegments.splice(5, 0, page.toString());
            dirSegments[5] = page.toString();
        }
        else {
            if (dirSegments[3] == 'status') dirSegments.splice(3, 0, page.toString());
            dirSegments[3] = page.toString();
        }
        return dirSegments.join('/');
    }, [dirSegments]);
    return <GlobalPaging {...{pageCount, selectedPage}} href={getHref} />
}