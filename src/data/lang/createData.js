/** 
 * https://github.com/atmulyana/nextCart
 **/
const sqlite = require('sqlite3');
const fs = require('node:fs');
let {defaultLocale} = require('../../config/config.json');

const db = new sqlite.Database(
    `${__dirname}/data.sqlite`,
    sqlite.OPEN_READONLY,
    err => {
        if (err) console.error(err);
    }
);

const texts = {};
db.serialize(() => {
    let _primaryKey, _defaultKey;
    db.each("SELECT name, pk FROM PRAGMA_TABLE_INFO('locales') WHERE (pk = 1 OR name = ?) AND name <> 'idx'",
        [defaultLocale],
        (_, key) => {
            if (!key) return;
            if (key.pk == 1) _primaryKey = key.name;
            else _defaultKey = key.name;
        },
        () => {
            defaultLocale = _defaultKey || _primaryKey;
        }
    );
    db.each("SELECT * FROM locales", [],
        (_, lang) => {
            if (!lang) return;
            const key = lang[defaultLocale];
            const idx = lang.idx;
            if (!Array.isArray(texts[key])) texts[key] = [];
            texts[key][idx] = {};
            for (const locale in lang) {
                if (locale != defaultLocale && locale != 'idx') texts[key][idx][locale] = lang[locale];
            }
        },
        err => {
            if (err) return;
            const content = JSON.stringify({defaultLocale, texts});
            try {
                fs.writeFileSync(`${__dirname}/data.json`, content);
            } catch (err) {
                console.error(err);
            }
        }
    );
});
db.close();