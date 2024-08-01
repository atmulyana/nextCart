/** 
 * https://github.com/atmulyana/nextCart
 **/
import * as React from 'react';
import {headers} from "next/headers";
import Image from 'next/image';
import Link from 'next/link';
import config from '@/config';
import lang from '@/data/lang';
import Footer from '@/partials/Footer';
import DarkModeMenu from '@/partials/DarkModeMenu';
import FrontMenu from '@/partials/FrontMenu';
import LanguangeMenu from '@/partials/LanguageMenu';

export default function NotFoundPage() {
    const pathname = headers().get('x-request-path');
    let showFooter = false;
    if (pathname == '/admin' || pathname?.startsWith('/admin/')) showFooter = config.footer.shownForAdmin;
    else showFooter = config.footer.shownForCustomer;
    
    return <>
        <nav id="headerBar" className="flex items-center py-2 px-4 justify-between leading-normal">
            <Link href="/"><Image src='/images/logo.png' alt='logo' width={317} height={82} /></Link>
            <ul id="mainMenu" className="flex lg:flex-row ml-auto mb-0 mt-0 pl-0 list-none">
                <li className="hidden sm:block mx-2">
                    <DarkModeMenu />
                </li>
                
                {config.enableLanguages &&
                <li className="hidden sm:block mx-2">
                    <LanguangeMenu />
                </li>
                }
            </ul>
        </nav>
        <FrontMenu />
        <div id="container" className="flex items-center h-full py-8">
            <h3 className='text-center w-full'>{lang("What you're looking for is not found")}</h3>
        </div>
        {showFooter && <Footer />}
    </>;
}