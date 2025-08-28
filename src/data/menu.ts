/** 
 * https://github.com/atmulyana/nextCart
 **/
import type {Document, TMenu, WithoutId} from './types';
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

export const addMenu = fn(async (db: Db, menu: Omit<TMenu, '_id' | 'order'>) => {
    const dbMenu = db.collection<TMenu>('menu');

    const numbers = (await dbMenu.aggregate<{lastId: number, lastOrder: number}>([
        {
            $group: {
                _id: null,
                lastId: {$max: '$_id'},
                lastOrder: {$max: '$order'},
            }
        },
        {    $project: {
                _id: 0,
            }
        }
    ]).toArray())[0];

    const newMenu: TMenu = {
        ...menu,
        _id: numbers.lastId + 1,
        order: numbers.lastOrder + 1,
    }
    await dbMenu.insertOne(newMenu);
    return newMenu._id;
});

export const updateMenu = fn(async (db: Db, menu: Partial<WithoutId<TMenu>> & {_id: number}) => {
    const $set: Document = {...menu};
    delete $set._id;
    return (await db.collection<TMenu>('menu').updateOne(
        {_id: menu._id},
        {$set}
    )).modifiedCount > 0;
});

export const updateMenuOrder = fn(async (db: Db, ids: number[]) => {
    const dbMenu = db.collection<TMenu>('menu');
    const menu = (await dbMenu.find({}).toArray()).reduce(
        (obj, row) => {
            obj[row._id] = row;
            return obj;
        },
        {} as {[id: number]: TMenu}
    );
    
    if (ids.length != Object.keys(menu).length) throw new Error('invalid');
    const orders: {[id: number]: number} = {};
    for (let ord = 1; ord <= ids.length; ord++) {
        const id = ids[ord - 1];
        if (
            (id in orders) //double id
            || !(id in menu) //non-existence id
        ) throw new Error('invalid');

        orders[id] = ord;
        menu[id].order = ord;
    }

    const menuList = Object.values(menu);
    const bulk = dbMenu.initializeUnorderedBulkOp();
    for (let m of menuList) {
        bulk.find({
            _id: m._id
        }).updateOne({
            $set: {order: m.order}
        });
    }
    if (!(await bulk.execute()).isOk) throw new Error('failed');
    return menuList;
});

export const deleteMenu = fn(async (db: Db, id: number) => {
    return (await db.collection<TMenu>('menu').deleteOne({_id: id})).deletedCount > 0;
});