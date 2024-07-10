'use client';
/** 
 * https://github.com/atmulyana/nextCart
 **/
import React from 'react';
import Link from 'next/link';
import {usePathname} from 'next/navigation';

export default function Breadcrumb({homeText, items}: {
    homeText: string,
    items: Array<{
        text: string,
        path: string,
    }>,
}) {
    const currentPath = usePathname();
    return <nav aria-label='breadcrumb'>
        <ol className='flex flex-wrap bg-gray-100 dark:bg-gray-900 mt-3 mb-4 px-3 py-4 rounded list-none'>
            <li key='Home'><Link href='/' prefetch={false}>{homeText}</Link></li>
            {items.map((item, idx) => <li key={idx}> / {
                currentPath == item.path
                    ? <strong>{item.text}</strong>
                    : <Link href={item.path} prefetch={false}>{item.text}</Link>
            }</li>)}
        </ol>
    </nav>;
}