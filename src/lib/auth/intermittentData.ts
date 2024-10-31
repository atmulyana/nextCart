/** 
 * https://github.com/atmulyana/nextCart
 **/
const DATA = new Map<string, Map<string, {
    value: any,
    counter: number,
}>>();

export function setData(
    sessionId: string,
    prop: string | {[name: string]: any},
    value?: any,
    counter: number = 1
) {
    let data = DATA.get(sessionId);
    if (!data) {
        data = new Map<string, any>();
        DATA.set(sessionId, data);
    }

    if (typeof(prop) == 'string') {
        if (value !== undefined) data.set(prop, {value, counter});
    }
    else {
        for (let name in prop) {
            data.set(name, {value: prop[name], counter});
        }
    }

    if (data.size < 1) DATA.delete(sessionId);
}

export function getData<T = any>(sessionId: string, name:  string) {
    let data = DATA.get(sessionId);
    if (data) {
        const dataVal = data.get(name);
        if (dataVal) {
            dataVal.counter--;
            const value = dataVal.value;
            if (dataVal.counter < 1) {
                data.delete(name);
                if (data.size < 1) DATA.delete(sessionId);
            }
            else {
                data.set(name, dataVal);
            }
            return value as T;
        }
    }
}