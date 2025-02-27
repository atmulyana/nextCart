'use server';
/** 
 * https://github.com/atmulyana/nextCart
 **/
import lang from '@/data/lang';
import {mergeData} from '@/lib/data-sanitize';
import {getSchema, getSchemaProps as _getSchemaProps, type InputProps, Schema, validateForm} from '@/lib/schemas';

export async function initValidationActions() {
    //For bundling
}

export async function validate(schemaName: string, formData: FormData, action: (formData: FormData) => any) {
    const validation = await validateForm(schemaName, formData);
    if (!validation.success) {
        if ('messages' in validation) {
            return {
                __validation_messages__: validation.messages,
            };
        }
        else {
            return {
                message: lang(validation.message),
            };
        }
    }

    const data = action(mergeData(validation.data, formData));
    if (data instanceof Promise) return await data;
    return data;
}

export async function getSchemaProps(schemaName: string) {
    const schema = await getSchema(schemaName);
    return _getSchemaProps(schema);
}