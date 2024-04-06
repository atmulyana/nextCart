/** 
 * https://github.com/atmulyana/nextCart
 **/
import {isPlainObject} from './common';

export function sanitize(value) {
    if (value[0] == '$') return {$literal: value};
    return value;
}

FormData.prototype.getDate = function(paramName) {
    const value = this.get(paramName);
    if (typeof(value) == 'string') {
        const sVal = value.trim();
        if (sVal == '') return null;
        const dt = new Date(sVal);
        if (isNaN(dt.getDate())) return null;
        return dt;
    }
    return null;
}

FormData.prototype.getFile = function(paramName) {
    const value = this.get(paramName);
    return (value instanceof File) ? value : null;
}

const reNumber = /^\s*(\+|-)?(\d+(\.\d+)?|\.\d+)\s*$/;
FormData.prototype.getNumber = function(paramName) {
    const value = this.get(paramName);
    return (reNumber.test(value)) ? parseFloat(value.trim()) : NaN;
}

FormData.prototype.getString = function(paramName) {
    const value = this.get(paramName);
    return (typeof(value) == 'string') ? value : '';
}

FormData.prototype.sanitize = function(paramName) {
    const value = this.get(paramName);
    if (typeof(value) == 'string') {
        return sanitize(value);
    }
    return null;
}

class AppFormData extends FormData {
    #data = {};
    
    constructor(data) {
        super();
        if (isPlainObject(data)) this.#data = data;
    }

    getDate(paramName) {
        if (this.#data[paramName] instanceof Date) return this.#data[paramName];
        return super.getDate(paramName);
    }

    getNumber(paramName) {
        if (typeof(this.#data[paramName]) == 'number') return this.#data[paramName];
        return super.getNumber(paramName);
    }

    getString(paramName) {
        if (typeof(this.#data[paramName]) == 'string') return this.#data[paramName];
        return super.getString(paramName);
    }
}

export function mergeData(data, formData) {
    const newData = new AppFormData(data);
    for (const kvp of formData) {
        newData.append(kvp[0], kvp[1]);
    }
    return newData;
}
