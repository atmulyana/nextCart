"use client";
/** 
 * https://github.com/atmulyana/nextCart
 **/
import type {TMenu, WithoutId} from '@/data/types'
import React from "react";
import {createPortal} from 'react-dom';
import Link from "next/link";
import {usePathname, useRouter} from 'next/navigation';
import Icon from '@/subview/components/Icon';

export default React.memo(function FrontMenuBar({
    items,
    homeMenuTitle,
    searchPlaceHolder,
    searchButtonLabel,
} : {
    items: TMenu[],
    homeMenuTitle: string,
    searchPlaceHolder: string,
    searchButtonLabel: string,
}) {
    const pathname = usePathname();
    const [menuBtn, setMenuBtn] = React.useState<HTMLButtonElement>();
    const [visible, setVisible] = React.useState(false);

    React.useEffect(() => {
        const btn = document.createElement('button');
        btn.classList.add('lg:hidden', 'py-1', 'text-xl/none');
        document.getElementById('headerBar')?.insertBefore(btn, document.getElementById('mainMenu'));
        btn.onclick = () => {
            setVisible(visible => !visible);
        };
        setMenuBtn(btn);

        return () => {
            btn.remove();
        };
    }, []);

    if (pathname == '/admin' || pathname.startsWith('/admin/')) return null;

    const menuItems: WithoutId<TMenu>[] = [
        {
            title: homeMenuTitle,
            link: '/',
            order: 0,
        },
        ...items,
    ];

    return <>
        {menuBtn && menuBtn.parentNode && createPortal(<Icon name="menu" />, menuBtn)}
        <nav className={`py-2 px-4 bg-gray-100 dark:bg-stone-950
            ${visible ? 'flex' : 'lg:flex hidden'} justify-between lg:justify-start
            items-center sm:grow-0 sm:shrink-0 sm:basis-full sm:max-w-full w-full`}
        >
            <div className="!relative w-full px-4 md:ml-[16.666667%] sm:max-w-[66.666667%]
                    flex lg:!flex flex-row flex-wrap lg:flex-nowrap items-center
                    grow sm:grow-0 sm:shrink-0 basis-full sm:basis-2/3 lg:basis-auto"
            >
                <ul className="list-none my-0 !mr-auto pl-0 flex flex-col lg:flex-row">
                {menuItems.map(item => (
                    <li key={item.link}>
                        <Link href={item.link} prefetch={false}
                            className={`block py-2 px-4 lg:px-2 ${pathname == item.link ? 'opacity-90' : 'opacity-50'}`}
                        >{item.title}</Link>
                    </li>
                ))}
                </ul>
                <SearchForm searchButtonLabel={searchButtonLabel} searchPlaceHolder={searchPlaceHolder} />
            </div>
        </nav>
    </>;
});

const SearchForm = React.memo(function SearchForm({searchButtonLabel, searchPlaceHolder}: {searchButtonLabel:string, searchPlaceHolder: string}) {
    const router = useRouter();
    const searchText = React.useRef<HTMLInputElement | null>(null);
    const path = usePathname();
    let searchVal = '';
    if (path.startsWith('/search/')) {
        searchVal = decodeURIComponent(path.substring('/search/'.length));
    }

    return <div className="relative flex flex-wrap items-stretch mt-0 !ml-auto sm:w-auto">
        <input
            ref={inpRef => {
                searchText.current = inpRef;
                // if (inpRef) {
                //     inpRef.addEventListener('search', () => { /** NOT working on Safari **/
                //         ((inpRef as HTMLInputElement).nextSibling as HTMLButtonElement).click();
                //     });
                // }
            }}
            type="search"
            aria-label="Search" 
            placeholder={searchPlaceHolder}
            className="flex-1 min-w-0 !rounded-r-none"
            defaultValue={searchVal}
            onKeyDown={e => {
                if (e.key == "Enter") ((e.target as HTMLInputElement).nextSibling as HTMLButtonElement).click();
            }}
        />
        <button type="button"
            className="-ml-px rounded-l-none btn-outline-success" 
            onClick={() => {
                const searchTerm = searchText.current?.value.trim();
                const newPath = searchTerm ? `/search/${encodeURIComponent(searchTerm)}` : '/';
                if (newPath != path) router.push(newPath);
                else router.refresh();
            }}
        >{searchButtonLabel}</button>
    </div>
});