/** 
 * https://github.com/atmulyana/nextCart
 **/
import React from 'react';
import Link from 'next/link';
import {notFound} from 'next/navigation';
import {emptyString} from 'javascript-common';
import config from '@/config';
import lang from '@/data/lang';
import {getPages} from '@/data/page';
import {awaitProps, fnMeta, isIndexNumber} from '@/lib/common';
import DeleteButton from '@/components/DeleteButton';
import Icon from '@/components/Icon';
import Form from '@/components/Form';
import Paging from '@/components/Paging';
import Template from '@/components/partials/Template';
import {remove} from '../actions';

export const generateMetadata = fnMeta(async () => {
    return {
        title: `${config.cartTitle}: ${lang('Static pages')}`,
    };
});

export default async function StatiPages(props: {params: Promise<{pageIdx?: string[]}>}) {
    const {params: {pageIdx = ['1']}} = await awaitProps(props);
    if (pageIdx.length > 1 || !isIndexNumber(pageIdx[0])) return notFound();
    const pageNum = parseInt(pageIdx[0]);
    if (pageNum < 1) return notFound();

    const pages = await getPages(pageNum);
    let _id: string = emptyString;

    return <Template>
        <div className='flex'>
            <h2 className='flex-1'>{lang('Static pages')}</h2>
            <Link href='/admin/settings/pages/form' className='flex-none btn btn-outline-success'>{lang('New page')}</Link>
        </div>
        <p className='text-gray-500'>{lang('Here you can setup and manage static pages for your shopping cart. You may want to setup a page with a little bit about your business called "About" or "Contact Us" etc.')}</p>

        {pages.totalItems < 1 ? (<>
            <h4 className="text-[var(--color-warning)] text-center">{lang("There are currently no static pages setup. Please setup a static page.")}</h4>
            <p className="text-center">
                <Link className="btn btn-outline-success" href="/admin/settings/pages/form"> {lang("Create new")}</Link>
            </p>
        </>) : (<ul className='bordered'>
            <li className='!flex bg-gray-200 dark:bg-gray-800'>
                <strong className='flex-1'>{lang('Name')}</strong>
                <strong className='w-1/4 shrink-0 ml-4'>{lang('Page slug')}</strong>
                <strong className='ml-4'>{lang('Enabled')}</strong>
                <strong className='ml-4'>{lang('Edit')}</strong>
                <strong className='ml-4'>{lang('Delete')}</strong>
            </li>
            {pages.data.map(p => (_id = p._id.toString(),
                <li key={_id} className='!flex bg-[var(--bg-color)] hover:bg-gray-100 hover:dark:bg-gray-900'>
                    <span className='flex-1'>{p.name}</span>
                    <span className='w-1/4 shrink-0 ml-4'>{p.slug}</span>
                    <div className='relative ml-4'>
                        <strong className='opacity-0'>{lang('Enabled')}</strong>
                        <span
                            className={`absolute left-0 top-0 right-0 bottom-0 text-center text-[var(--color-${
                                p.enabled ? 'success' : 'danger'
                            })]`}
                            title={lang(p.enabled ? 'Enabled' : 'Disabled')}
                        >
                            <Icon name={p.enabled ? 'check' : 'slash'} strokeWidth={4} />
                        </span>
                    </div>
                    <div className='relative ml-4'>
                        <strong className='opacity-0'>{lang('Edit')}</strong>
                        <span className='absolute left-0 top-0 right-0 bottom-0 text-center'>
                            <Link href={`/admin/settings/pages/form/${_id}`} title={lang('Edit')}><Icon name='edit' /></Link>
                        </span>
                    </div>
                    <span className='relative ml-4'>
                        <strong className='opacity-0'>{lang('Delete')}</strong>
                        <Form 
                            action={remove}
                            className='!absolute left-0 top-0 right-0 bottom-0 text-center text-[var(--color-danger)]'
                            loading={null}
                            refreshThreshold='success'
                        >
                            <input type='hidden' name='id' value={_id} />
                            <DeleteButton question={lang('Are you sure you want to proceed?')} title={lang('Delete')} />
                        </Form>
                    </span>
                </li>
            ))}
        </ul>)}
        <div className='flex justify-center w-full'>
            <Paging
                pageCount={Math.ceil(pages.totalItems / pages.itemsPerPage)}
                selectedPage={pageNum}
                href={'/admin/settings/pages'}
            />
        </div>
    </Template>;
}