'use server';
/** 
 * https://github.com/atmulyana/nextCart
 **/
import lang from '@/data/lang';
import {mergeData} from '@/lib/data-sanitize';
import {getSchema, getSchemaProps as _getSchemaProps, type InputProps, Schema} from '@/lib/schema';

export async function initValidationActions() {
    //For bundling
}

export async function validate(schemaName: string, formData: FormData, action: (formData: FormData) => any) {
    let schema!: Schema;
    try {
        schema = await getSchema(schemaName);
    }
    catch {
        return {
            message: lang('Invalid schema name'),
        };
    }

    const inputNames = Object.keys(schema.shape);
    const inputValues: InputProps = {};
    for (let name of inputNames) {
        let value: FormDataEntryValue[] | FormDataEntryValue | null = formData.getAll(name);
        if (value.length < 1) value = null;
        else if (value.length == 1) value = value[0];
        inputValues[name] = value;
    }
    const validation = await schema.validate(inputValues);
    if (!validation.success) {
        return {
            __validation_messages__: validation.messages,
        };
    }

    const data = action(mergeData(validation.data, formData));
    if (data instanceof Promise) return await data;
    return data;
}

export async function getSchemaProps(schemaName: string) {
    const schema = await getSchema(schemaName);
    return _getSchemaProps(schema);
}