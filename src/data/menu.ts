/** 
 * https://github.com/atmulyana/nextCart
 **/
import type {TMenu} from './types';
import fn, {type Db} from './db-conn';
import lang from './lang';

export const getMenu = fn(async (db: Db) => {
    return (await db.collection<TMenu>('menu').find({}).toArray())
        .map(item => (item.title = lang(item.title), item));
});

export function sortMenu(menu: TMenu[] | undefined | null): TMenu[] {
    return menu
        ? menu.sort((item1, item2) => item1.order - item2.order)
        : [];
}