/** 
 * https://github.com/atmulyana/nextCart
 **/
import 'server-only';
//import {cache} from 'react';
import sqlite from 'sqlite3';
import {getRootPath} from 'next-server-root-dir';
import currentLocale from '@/lib/currentLocale/server';
import config from '@/config';
let {defaultLocale} = config;

type Locale = {
    idx: any,
    [locale: string]: string
}

import './data.sqlite'; //instructs Webpack to bundle db file
const serverRoot = getRootPath();
const dbPath = serverRoot ? `${serverRoot}/data/lang/data.sqlite` : `${__dirname}/data.sqlite`;
async function connectDb(): Promise<sqlite.Database> {
    return new Promise((resolve, reject) => {
        const db = new sqlite.Database(
            dbPath,
            sqlite.OPEN_READONLY,
            err => {
                if (err) reject(err);
                else resolve(db);
            }
        );
    });
}


const init = async () => {
    const texts: {[s: string]: Array<{[locale: string]: string}>} = {};
    const db = await connectDb();
    await new Promise(resolve => {
        let _primaryKey!: string,
            _defaultKey: string | undefined;
        db.each<{name: string, pk: number}>("SELECT name, pk FROM PRAGMA_TABLE_INFO('locales') WHERE (pk = 1 OR name = ?) AND name <> 'idx'",
            [defaultLocale],
            (_, key) => {
                if (!key) return;
                if (key.pk == 1) _primaryKey = key.name;
                else _defaultKey = key.name;
            },
            () => {
                defaultLocale = _defaultKey || _primaryKey;
                config.defaultLocale = defaultLocale;
                resolve(true);
            }
        );
    });
    await new Promise(resolve => {
        db.each<Locale>("SELECT * FROM locales", [],
            (_, lang) => {
                if (!lang) return;
                const key = lang[defaultLocale];
                const idx = lang.idx as number;
                if (!Array.isArray(texts[key])) texts[key] = [];
                texts[key][idx] = {};
                for (const locale in lang) {
                    if (locale != defaultLocale && locale != 'idx') texts[key][idx][locale] = lang[locale];
                }
            },
            () => resolve(true)
        );
    });
    db.close();

    return (s: string, idx: number = 0, locale: string = currentLocale()) =>
        texts[s] && (
            texts[s][idx] && texts[s][idx][locale] ||
            texts[s][0] && texts[s][0][locale]
        ) || s;
}

const lang = await init();
export default lang;