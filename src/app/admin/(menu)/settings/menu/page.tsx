/** 
 * https://github.com/atmulyana/nextCart
 **/
import React from 'react';
import config from '@/config';
import lang from '@/data/lang';
import {getMenu, sortMenu} from '@/data/menu';
import {fnMeta} from '@/lib/common';
import Template from '@/components/partials/Template';
import Menu from './Menu';

export const generateMetadata = fnMeta(async () => {
    return {
        title: `${config.cartTitle}: ${lang('Menu')}`,
    };
});

export default async function MenuSettings() {
    const menu = sortMenu(await getMenu());

    return <Template>
        <h2 className='pb-5'>{lang('Menu')}</h2>
        <div>
            <Menu
                menu={menu}
                texts={{
                    add: lang('Add'),
                    addTitlePlaceholder: lang('Contact Us'),
                    addLinkPlaceholder: '/contact',
                    delete: lang('Delete'),
                    deleteQuestion: lang('Are you sure you want to proceed?'),
                    menu: lang('Menu'),
                    link: 'URL (link)',
                    move: lang('Move'),
                    update: lang('Update'),
                }}
            />
        </div>
    </Template>;
}