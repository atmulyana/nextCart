/** 
 * https://github.com/atmulyana/nextCart
 **/
import React from "react";
import {getMenu, sortMenu} from '@/data/menu';
import MenuBar from "./MenuBar";
import lang from '@/data/lang';

export default async function FrontMenu() {
    const menu = await getMenu();
    return <MenuBar
        items={sortMenu(menu)}
        homeMenuTitle={lang('Home')}
        searchPlaceHolder={lang('Search shop')}
        searchButtonLabel={lang('Search')}
    />;
}