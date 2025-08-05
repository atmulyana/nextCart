/** 
 * https://github.com/atmulyana/nextCart
 **/
import {validate, validateAsync} from '@react-input-validator/helpers';
import {alwaysValid, ValidationRule} from '@react-input-validator/rules';
import type {Rule, Rules, ValidateParam} from '@react-input-validator/web';
import lang from '@/data/lang';
import {isOnBrowser} from '../common';

export type RuleArray = Exclude<Rules, Rule>;

export class Schema {
    #shape!: {[name: string]: Rules<any>};
    constructor(shape: Schema['shape']) {
        this.#shape = shape;
    }
    get shape() {
        return this.#shape;
    }
}

export type InputProps = {
    name?: string,
    rules: Rules,
};
export type InputsProps = {
    [inputName: string]: InputProps
};

export async function getSchema(name: string, isClient: boolean = isOnBrowser()) {
    let schema: Schema | undefined;
    try {
        schema = (await (
            isClient
                ? import(/* webpackMode: "eager" */`./client/${name}`)
                : import(/* webpackMode: "eager" */`@__server__/${name}`)
        )).default;
    }
    catch {
        schema = (await import(/* webpackMode: "eager" */`./all/${name}`)).default;
    }
    if (!(schema instanceof Schema)) throw 'Invalid schema name';
    return schema;
}

export async function getSchemaProps(schema: Schema | string, isClient?: boolean) {
    if (typeof(schema) == 'string') schema = await getSchema(schema, isClient);
    const inputsProps: InputsProps = {};
    for (let name in schema.shape) {
        inputsProps[name] = {
            name,
            rules: schema.shape[name],
        };
    }
    return inputsProps;
}

function getInputValue(formData: FormData, name: string) {
    let value: FormDataEntryValue[] | FormDataEntryValue | null = formData.getAll(name);
    if (value.length < 1) value = null;
    else if (value.length == 1) value = value[0];
    return value;
}

type RMessage = {message: string};
type RMessages = {messages: {[p: string]: string}};
type ValidateRet<T extends (string | undefined)> = {
    success: boolean,
    data: {
        [p: string]: any
    },
} & (
    T extends string ? (
        T extends '' ? (RMessage | RMessages) : RMessage
    ) : (RMessage | RMessages)
);
export async function validateForm<T extends (string | undefined) = undefined>(
    schemaName: string,
    formData: FormData,
    inputName?: T
): Promise<ValidateRet<T>> {
    let schema!: Schema;
    try {
        schema = await getSchema(schemaName);
    }
    catch {
        return {
            success: false,
            data: {},
            message: 'Invalid schema name',
        } as any;
    }

    const data: {[prop: string]: any} = {};
    const inputValues: {[p: string]: any} = new Proxy({}, {
        get(_, name) {
            if (typeof(name) != 'string') return void(0);
            let value: any = getInputValue(formData, name);
            if (name in data) value = data[name];
            else if (name in schema.shape) {
                const resObj: ValidateParam = {
                    name,
                    inputValues,
                };
                const _rules = schema.shape[name];
                const rules: Exclude<Rules, Rule> = [
                    alwaysValid,
                    ...(Array.isArray(_rules) ? _rules : [ _rules ]).filter(r => r instanceof ValidationRule)
                ];
                if (typeof validate(
                    value,
                    rules,
                    resObj
                ) != 'string') {
                    value = resObj.resultValue;
                }
            }
            return value;
        },
        set() {
            throw new Error("Not supported!")
        }
    });

    const messages: {[prop: string]: string} = {};
    
    const validateInput = async (name: string) => {
        const value = getInputValue(formData, name);
        const resObj: ValidateParam = {
            name,
            inputValues,
        };
        const retVal = await validateAsync(value, schema.shape[name], resObj, lang);
        if (typeof(retVal) == 'string') {
            messages[name] = retVal;
        }
        else {
            data[name] = resObj.resultValue;
        }
    }

    if (inputName) {
        await validateInput(inputName);
    }
    else {
        for (let name in schema.shape) {
            await validateInput(name);
        }
    }

    const ret = {
        get success() {
            return Object.keys(messages).length < 1;
        },
        data
    };
    if (inputName) return {...ret, message: messages[inputName]} as any;
    return {...ret, messages} as any;
}