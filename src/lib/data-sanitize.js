/** 
 * https://github.com/atmulyana/nextCart
 **/
import {emptyString} from 'javascript-common';
import {isPlainObject, numericRegex} from './common';

export function sanitize(value) {
    if (value[0] == '$') return {$literal: value};
    return value;
}

FormData.prototype.getBoolean = function(paramName, isToString = false) {
    if (isToString) {
        const value = this.getString(paramName).toLowerCase();
        if (value == 'true') return true;
        if (value == 'false') return false;
        return null;
    }
    return this.has(paramName);
}

FormData.prototype.getDate = function(paramName) {
    const value = this.get(paramName);
    if (typeof(value) == 'string') {
        const sVal = value.trim();
        if (sVal == emptyString) return null;
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

FormData.prototype.getNumber = function(paramName) {
    const value = this.getString(paramName);
    return (numericRegex.test(value)) ? parseFloat(value) : NaN;
}

FormData.prototype.getString = function(paramName, trimmed = true) {
    const value = this.get(paramName);
    return (typeof(value) == 'string') ? (trimmed ? value.trim() : value) : emptyString;
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

    get(paramName) {
        if (paramName in this.#data) return this.#data[paramName];
        return super.get(paramName);
    }

    getBoolean(paramName, isToString = false) {
        if (typeof(this.#data[paramName]) == 'boolean') return this.#data[paramName];
        return super.getBoolean(paramName, isToString);
    }

    getDate(paramName) {
        if (this.#data[paramName] instanceof Date) return this.#data[paramName];
        return super.getDate(paramName);
    }

    getNumber(paramName) {
        if (typeof(this.#data[paramName]) == 'number') return this.#data[paramName];
        return super.getNumber(paramName);
    }

    getString(paramName, trimmed = true) {
        if (typeof(this.#data[paramName]) == 'string') return this.#data[paramName];
        return super.getString(paramName, trimmed);
    }
}

export function mergeData(data, formData) {
    const newData = new AppFormData(data);
    for (const kvp of formData) {
        newData.append(kvp[0], kvp[1]);
    }
    return newData;
}
