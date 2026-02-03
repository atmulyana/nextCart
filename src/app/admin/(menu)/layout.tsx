/** 
 * https://github.com/atmulyana/nextCart
 **/
import './admin.css';
import Link from 'next/link';
import {adminLogout} from '@/app/actions';
import config from '@/config';
import lang from '@/data/lang';
import {getSession} from '@/data/session';
import Icon from '@/components/Icon';
import DarkModeMenu from '@/components/partials/DarkModeMenu';
import LanguangeMenu from '@/components/partials/LanguageMenu';
import Footer from '@/components/partials/Footer';
import {SearchIcon} from './search';

export default async function ShopLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await getSession();
    return <>
        <div id="container" className="relative flex flex-wrap h-full w-full mx-auto">
            <nav className={`hidden md:block! md:w-1/4 lg:w-1/6 shrink-0 fixed left-0 top-0 
                ${config.footer.shownForAdmin ? 'bottom-[100px]' : 'bottom-0'} z-40
                shadow-[inset_-1px_0_0_rgba(0,0,0,0.1)] dark:shadow-[inset_-1px_0_0_rgba(255,255,255,0.1)]
                bg-white dark:bg-black`}
            >
                <div className='absolute left-0 right-0 top-0 bottom-0 overflow-x-hidden overflow-y-auto pb-10'>
                    <ul className='flex flex-col flex-wrap my-0 pl-0 list-none'>
                        <li className='flex items-center'>
                            <Link href='/admin' className='inline-block py-2 px-4 w-4/5'>
                                {/*eslint-disable-next-line @next/next/no-img-element*/}
                                <img src='/images/logo.svg' alt='Logo' className='h-12' />
                            </Link>
                            <SearchIcon
                                customerText={lang('Customer')}
                                noItemText={lang('Nothing found')}
                                orderText={lang('Order')}
                                productText={lang('Product')}
                            />
                        </li>
                        <li>
                            <Link href='/admin/dashboard' className='block py-2 px-4 text-slate-700 dark:text-slate-700 noline'>
                                <Icon name='bar-chart' /> &nbsp; {lang('Dashboard')}
                            </Link>
                        </li>
                        <h6 className='flex items-center justify-between text-xs/tight uppercase text-gray-500 px-4 mt-6 mb-1'>
                            <span>{lang('Data Management')}</span>
                        </h6>
                        <li className={session.isAdmin ? 'h-10' : ''}>
                            <Link href='/admin/products' className={`inline-block py-2 px-4 text-slate-700 dark:text-slate-700 noline${
                                session.isAdmin ? ' w-4/5' : ''
                            }`}>
                                <Icon name='tag' /> &nbsp; {lang('Products')}
                            </Link>
                            {session.isAdmin && <Link href='/admin/products/form' className='inline-block w-1/12 text-gray-500 noline'>
                                <Icon name='plus' />
                            </Link>}
                        </li>
                        <li className='h-10'>
                            <Link href='/admin/orders' className='inline-block py-2 px-4 text-slate-700 dark:text-slate-700 w-4/5 noline'>
                                <Icon name='package' /> &nbsp; {lang('Orders')}
                            </Link>
                            <Link href='/admin/orders/create' className='inline-block w-1/12 text-gray-500 noline'>
                                <Icon name='plus' />
                            </Link>
                        </li>
                        <li>
                            <Link href='/admin/customers' className='inline-block py-2 px-4 text-slate-700 dark:text-slate-700 noline'>
                                <Icon name='users' /> &nbsp; {lang('Customers')}
                            </Link>
                        </li>
                        <li className='h-10'>
                            <Link href='/admin/users' className='inline-block py-2 px-4 text-slate-700 dark:text-slate-700 w-4/5 noline'>
                                <Icon name='user' /> &nbsp; {lang('Users')}
                            </Link>
                            {session.isAdmin && <Link href='/admin/users/form' className='inline-block w-1/12 text-gray-500 noline'>
                                <Icon name='plus' />
                            </Link>}
                        </li>
                        {config.modules.enabled.reviews && <li>
                            <Link href='/admin/reviews' className='inline-block py-2 px-4 text-slate-700 dark:text-slate-700 noline'>
                                <Icon name='star' /> &nbsp; {lang('Reviews')}
                            </Link>
                        </li>}
                    </ul>

                    <h6 className="flex items-center justify-between text-xs/tight uppercase text-gray-500 px-4 mt-6 mb-1">
                        <span>{lang('Settings')}</span>
                    </h6>
                    <ul className='flex flex-col flex-wrap mt-0 mb-2 pl-0 list-none'>
                        <li>
                            <DarkModeMenu
                                className='inline-block py-2 px-4 text-slate-700 dark:text-slate-700'
                                label={<><Icon name='moon' /> &nbsp; {lang('Dark Mode')}</>}
                            />
                        </li>
                        <li>
                            <LanguangeMenu
                                className='inline-block py-2 px-4 text-slate-700 dark:text-slate-700'
                                label={<><Icon name='globe' /> &nbsp; {lang('Language')}</>}
                            />

                        </li>
                        <li>
                            <Link href='/admin/settings' className='inline-block py-2 px-4 text-slate-700 dark:text-slate-700 noline'>
                                <Icon name='sliders' /> &nbsp; {lang('General settings')}
                            </Link>
                        </li>
                        <li>
                            <Link href='/admin/settings/menu' className='inline-block py-2 px-4 text-slate-700 dark:text-slate-700 noline'>
                                <Icon name='menu' /> &nbsp; {lang('Menu')}
                            </Link>
                        </li>
                        <li>
                            <Link href='/admin/settings/pages' className='inline-block py-2 px-4 text-slate-700 dark:text-slate-700 noline'>
                                <Icon name='file-text' /> &nbsp; {lang('Static pages')}
                            </Link>
                        </li>
                        {session.isAdmin && <li>
                            <Link href='/admin/settings/discounts' className='inline-block py-2 px-4 text-slate-700 dark:text-slate-700 noline'>
                                <Icon name='code' /> &nbsp; {lang('Discount codes')}
                            </Link>
                        </li>}
                    </ul>
                    <h6 className="flex items-center justify-between text-xs/tight uppercase text-gray-500 px-4 mt-6 mb-1">
                        <span>{lang('User')}</span>
                    </h6>
                    <ul className='flex flex-col flex-wrap mb-0 pl-0 list-none'>
                        <li>
                            <small className='inline-block px-4 text-slate-700 dark:text-slate-700'>
                                {session.usersName} ({session.user})
                            </small>
                            <form action={adminLogout} className='inline-block py-2 px-4 text-slate-700 dark:text-slate-700'>
                                <button type='submit' className='bg-transparent border-none p-0 m-0 h-6 text-left cursor-pointer'>
                                    <Icon name='log-out' /> &nbsp; {lang('Logout')}
                                </button>
                            </form>
                        </li>
                    </ul>
                </div>
            </nav>
            <main role="main" className='relative mb-5 sm:ml-auto! px-6 md:py-5 w-full md:w-3/4 lg:w-5/6 shrink-0'>
                {children}
            </main>
        </div>
        {config.footer.shownForAdmin && <>
            <div className='h-[100px]'></div>
            <Footer />
        </>}
    </>;
}