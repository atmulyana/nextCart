/** 
 * https://github.com/atmulyana/nextCart
 **/
import './pushy.css';
import './pushy-modifier.css';
import Image from 'next/image';
import Link from 'next/link';
import config from '@/config';
import {CartContext, CartOpenButton} from '@/components/Cart';
import AccountMenu from '@/components/partials/AccountMenu';
import DarkModeMenu from '@/components/partials/DarkModeMenu';
import LanguangeMenu from '@/components/partials/LanguageMenu';
import Footer from '@/components/partials/Footer';
import SideCart from '@/components/partials/SideCart';
import {getCart} from '@/data/cart';
import type {TCart} from '@/data/types';
import lang from '@/data/lang';
import {fnMeta} from '@/lib/common';

export let title = `${lang('Shop')}: ${config.cartTitle}`;
export const generateMetadata = fnMeta(async () => {
    title = `${lang('Shop')}: ${config.cartTitle}`;
    return {
        title,
        openGraph: {
            siteName: config.cartTitle,
            type: 'website',
            title,
            url: config.baseUrl,
            description: config.cartDescription,
        },
        twitter: {
            card: 'summary',
            title,
            site: config.twitterHandle ? config.twitterHandle : config.baseUrl.toString(),
        },
    };
});

export default async function ShopLayout({
    children,
}: {
    children: React.ReactNode
}) {
    let _id: any, cart: TCart | undefined;
    const cartWithId = await getCart();
    //eslint-disable-next-line @typescript-eslint/no-unused-vars
    if (cartWithId) ({_id, ...cart} = cartWithId);
    
    return <CartContext cart={cart}>
        <nav id="headerBar" className="relative flex items-center py-2 px-4 lg:flex-row lg:flex-nowrap justify-between leading-normal">
            <Link href="/" className="inline-block
                text-[#cc3a2c] dark:text-[#33c5d3]
                text-[55px] tracking-[4px]
                pt-0 pl-[20px] pb-1.5 mr-4 max-lg:pl-0
                h-[80px] max-lg:h-[auto]
                whitespace-nowrap"
            >
                {config.cartLogo
                    ? <Image src={config.cartLogo} alt={config.cartTitle} className="h-full w-[auto]" />
                    : config.cartTitle
                }
            </Link>
            <ul id="mainMenu" className="flex lg:flex-row ml-auto mb-0 mt-0 pl-0 list-none">
                <li className="hidden sm:block mx-2">
                    <DarkModeMenu />
                </li>
                
                {config.enableLanguages &&
                <li className="hidden sm:block mx-2">
                    <LanguangeMenu />
                </li>
                }
                
                <li><AccountMenu accountLabel={lang('Account')} logoutLabel={lang('Logout')} /></li>
                <li><CartOpenButton cartText={lang('Cart')} /></li>
            </ul>
        </nav>
        <SideCart />
        <div id="container" className="relative flex flex-wrap h-full w-full mx-auto mb-10">
            {children}
        </div>
        {config.footer.shownForCustomer && <Footer />}
    </CartContext>;
}