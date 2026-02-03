/** 
 * https://github.com/atmulyana/nextCart
 **/
//require('server-only');
const fs = require('fs');
const {emptyString} = require('javascript-common');
const {getRootPath} = require('next-server-root-dir');

module.exports = {
    serverRoot: getRootPath,
    projectRoot: function() {
        const serverPaths = (getRootPath()?.split('/' /* Always separated by '/' (never '\') */) ?? []).filter(segment => !!segment);
        if (serverPaths.length < 1) return null;
        let i = serverPaths.length - 1;
        const systemRoot = serverPaths[0].endsWith(':') /* Windows drive */ ? emptyString : '/';
        while (i > 0) {
            try {
                if (
                    JSON.parse(
                        fs.readFileSync(systemRoot + serverPaths.slice(0, i).join('/') + '/package.json', 'utf8')
                    ).name == "next-cart"
                ) {
                    break;
                }
                else {
                    i--;
                } 
            }
            catch {
                i--;
            }
        }
        if (i > 0) return systemRoot + serverPaths.slice(0, i).join('/');
        return null;
    },
    readFileText: function(path, relativeToServer = true) {
        if (relativeToServer) path = getRootPath() + path;
        return fs.readFileSync(path, 'utf8');
    },
    readJSON: function(path, relativeToServer = true) {
        if (relativeToServer) path = getRootPath() + path;
        return JSON.parse( fs.readFileSync(path, 'utf8') );
    },
    saveFileText: function(path, text) {
        fs.writeFileSync(path, text);
    },
    saveJSON: function(path, obj) {
        fs.writeFileSync(
            path,
            JSON.stringify(obj, null, 4)
        );
    },
};
