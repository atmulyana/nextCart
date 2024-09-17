'use client';
/** 
 * https://github.com/atmulyana/nextCart
 **/
import React from 'react';
import Link from 'next/link';

type Props = {
    pageCount: number,
    href: string,
    selectedPage: number,
    maxVisibleCount?: number,
    containerClass?: string,
    commonClass?: string,
    notSelectedClass?: string,
    selectedClass?: string,
    disabledClass?: string,
}

function PageLink({className, href, text}: {className: string, href: string, text: string | number}) {
    return <li><Link className={className} href={href} prefetch={false}><span>{text}</span></Link></li>;
}

function PageItem({className, hidden = false, text}: {className: string, hidden?: boolean, text: number | string}) {
    return <li><a className={className}><span className={hidden ? 'opacity-0' : 'opacity-100'}>{text}</span></a></li>;
}

const Paging = React.memo(function Paging({
    pageCount,
    href,
    selectedPage,
    maxVisibleCount = 5,
    containerClass = '',
    commonClass = '',
    notSelectedClass = '',
    selectedClass = 'text-bold',
    disabledClass = 'text-neutral-500',
}: Props) {
    if (pageCount < 2) return null;
    
    const middlePageDistance = Math.floor(maxVisibleCount / 2); 
    let start = selectedPage - middlePageDistance;
    if (start < 1) start = 1;
    let end = start + maxVisibleCount - 1;
    if (end > pageCount) {
        end = pageCount;
        start = end - maxVisibleCount + 1;
        if (start < 1) start = 1;
    }
    let isFirstVisible = false, isLastVisible = false;
    const itemClass = `${commonClass} ${notSelectedClass}`,
          selectedItemClass = `${commonClass} ${selectedClass}`,
          disbaledItemClass = `${commonClass} ${disabledClass}`;
    const numbers: Array<React.ReactNode> = [];
    for (let page: number = start; page <= end; page++) {
        if (page == 1) isFirstVisible = true;
        if (page == pageCount) isLastVisible = true;
        if (page == selectedPage) {
            numbers.push(<PageItem key={page} className={selectedItemClass} text={page} />);
        }
        else {
            numbers.push(<PageLink key={page} className={itemClass} href={`${href}/${page}`} text={page} />);
        }
    }
    
    return <ul className={`flex list-none pl-0 mt-0 ${containerClass}`}>
        {isFirstVisible ? (
            <>
                <PageItem className={itemClass} hidden text={1} />
                <PageItem className={itemClass} hidden text='...' />
            </>
        ) : (
            <>
                <PageLink className={itemClass} href={`${href}/1`} text={1} />
                <PageItem className={itemClass} text='...' />
            </>
        )}

        {selectedPage <= 1 ? (
            <PageItem className={disbaledItemClass} text='&laquo;' />
        ) : (
            <PageLink className={itemClass} href={`${href}/${selectedPage - 1}`} text='&laquo;' />
        )}

        {numbers}
        
        {selectedPage >= pageCount ? (
            <PageItem className={disbaledItemClass} text='&raquo;' />
        ) : (
            <PageLink className={itemClass} href={`${href}/${selectedPage + 1}`} text='&raquo;' />
        )}
        
        {isLastVisible ? (
            <>
                <PageItem className={itemClass} hidden text='...' />
                <PageItem className={itemClass} hidden text={pageCount} />
            </>
        ) : (
            <>
                <PageItem className={itemClass} text='...' />
                <PageLink className={itemClass} href={`${href}/${pageCount}`} text={pageCount} />
            </>
        )}
    </ul>;
});
export default Paging;