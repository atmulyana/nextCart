/** 
 * https://github.com/atmulyana/nextCart
 **/
import React from 'react';
import {notFound} from 'next/navigation';
import config from '@/config';
import lang from '@/data/lang';
import {getPageById} from '@/data/page';
import {TPage} from '@/data/types';
import {awaitProps, fnMeta} from '@/lib/common';
import Form from '@/components/FormWithSchema';
import GoBackButton from '@/components/GoBackButton';
import HtmlEditor from '@/components/HtmlEditor';
import Button from '@/components/SubmitButton';
import CheckBox from '@/components/SubmittedCheckBox';
import DeleteButton from '@/components/DeleteButtonWithLoading';
import Input from '@/components/SubmittedInput';
import Template from '@/components/partials/Template';
import {erase, save} from '../actions';

export const generateMetadata = fnMeta<{id?: string}>(async ({params: {id}}) => {
    return {
        title: `${config.cartTitle}: ${id ? lang('Edit page') : lang('New page')}`,
    };
});

export default async function StaticPageForm(props: {params: Promise<{id?: string}>}) {
    const {params: {id}} = await awaitProps(props);
    let page: TPage | undefined | null;
    if (id) {
        page = await getPageById(id);
        if (!page) return notFound();
    }

    return <Template>
    <Form schemaName='page' action={save}>
        <div className='flex mx-4 pb-5'>
            <h2 className='flex-1'>{lang(page ? 'Edit page' : 'New page')}</h2>
            <Button className='btn-outline-success flex-none ml-4'>{lang('Save')}</Button>
            {id && <DeleteButton
                action={async function() {
                    'use server';
                    return erase(id);
                }}
                deleteLabel={lang('Delete')}
                question={lang('Are you sure you want to proceed?')}
            />}
            <GoBackButton className='ml-4' label={lang('Go Back')} backUrl='/admin/settings/pages' />
        </div>
        {page && <input type='hidden' id='productId' name='id' value={page._id.toString()} />}
        <div className='mb-4 mx-4'>
            <label htmlFor='pageName'>{lang('Name')}&nbsp;*</label>
            <Input type='text' id='pageName' name='name' value={page?.name} />
            <div className='text-gray-500'>
                {lang('A friendly name to manage the static page.')}
            </div>
        </div>
        <div className='mb-4 mx-4'>
            <label htmlFor='pageSlug'>{lang('Page slug')}&nbsp;*</label>
            <Input type='text' id='pageSlug' name='slug' value={page?.slug} />
            <div className='text-gray-500'>
                {lang('This is the relative URL of the page. Eg: A setting of "about" would make the page available at: mydomain.com/about')}
            </div>
        </div>
        <div className='flex gap-4 items-center mb-4 mx-4'>
            <label htmlFor='pageEnabled'>{lang('Enabled')}</label>
            <CheckBox id='pageEnabled' name='enabled' noIndeterminate value={page?.enabled} />
        </div>
        <div className='mb-4 mx-4'>
            <label>{lang('Page content')}&nbsp;*</label>
            <HtmlEditor name='content' rows={10} value={page?.content} />
            <div className='text-gray-500'>
                {lang('Here you can enter the content you wish to be displayed on your static page.')}
            </div>
        </div>
    </Form>
    </Template>;
}