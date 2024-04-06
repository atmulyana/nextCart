/** 
 * https://github.com/atmulyana/nextCart
 **/
import type {TMenu} from './types';
import fn, {type Db} from './db-conn';

export const getMenu = fn(async (db: Db) => {
    return await db.collection<TMenu>('menu').find({}).toArray();
});

export function sortMenu(menu: TMenu[] | undefined | null): TMenu[] {
    return menu
        ? menu.sort((item1, item2) => item1.order - item2.order)
        : [];
}