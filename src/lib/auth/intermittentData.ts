/** 
 * https://github.com/atmulyana/nextCart
 **/
const DATA = new Map<string, Map<string, any>>();

export function setData(
    sessionId: string,
    prop: string | {[name: string]: any},
    value?: any,
) {
    let data = DATA.get(sessionId);
    if (!data) {
        data = new Map<string, any>();
        DATA.set(sessionId, data);
    }

    if (typeof(prop) == 'string') {
        if (value !== undefined) data.set(prop, value);
    }
    else {
        for (let name in prop) {
            data.set(name, prop[name]);
        }
    }

    if (data.size < 1) DATA.delete(sessionId);
}

export function getData<T = any>(sessionId: string, name:  string) {
    let data = DATA.get(sessionId);
    if (data) {
        const value = data.get(name);
        data.delete(name);
        if (data.size < 1) DATA.delete(sessionId);
        return value as T;
    }
}