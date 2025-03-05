/** 
 * https://github.com/atmulyana/nextCart
 **/
import * as React from 'react';
import {headers} from "next/headers";
import Link from 'next/link';
import config from '@/config';
import lang from '@/data/lang';
import Footer from '@/subview/partials/Footer';
import DarkModeMenu from '@/subview/partials/DarkModeMenu';
import FrontMenu from '@/subview/partials/FrontMenu';
import LanguangeMenu from '@/subview/partials/LanguageMenu';

export default async function NotFoundPage() {
    const pathname = (await headers()).get('x-request-path');
    let showFooter = false;
    if (pathname == '/admin' || pathname?.startsWith('/admin/')) showFooter = config.footer.shownForAdmin;
    else showFooter = config.footer.shownForCustomer;
    
    return <>
        <nav id="headerBar" className="flex items-center py-2 px-4 justify-between leading-normal">
            {/*eslint-disable-next-line @next/next/no-img-element*/}
            <Link href="/"><img src={`${config.baseUrl.path}/images/logo.svg`} alt='logo' style={{height: '80px'}} /></Link>
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