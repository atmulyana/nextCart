/** 
 * https://github.com/atmulyana/nextCart
 **/
import 'server-only';
import zod, {
    ZodBoolean,
    ZodDate,
    ZodDefault,
    ZodEffects,
    ZodNumber,
    ZodOptional,
    type ZodRawShape,
    type ZodTypeAny,
    ZodString,
    ZodType,
} from 'zod';

declare module 'zod' {
    interface ZodString {
        readonly pattern: string | null;
    }

    interface ZodDate {
        datetime(): ZodDate;
        readonly isDatetime: boolean;
        __isDatetime?: boolean;
    }
}

Object.defineProperty(ZodString.prototype, 'pattern', {
    get() {
        const check: any = (this as ZodString)._def.checks.find((ch) => ch.kind == "regex");
        if (check) {
            return (check.regex as RegExp).source;
        }
        return null;
    },
    enumerable: true,
});

Object.defineProperty(ZodDate.prototype, 'isDatetime', {
    get() {
        return !!(this as ZodDate).__isDatetime;
    },
    enumerable: true,
});
Object.defineProperty(ZodDate.prototype, '__isDatetime', {
    value: false,
    configurable: true,
    enumerable: false,  
});
ZodDate.prototype.datetime = function() {
    const schema = new ZodDate({...this._def, checks: [...this._def.checks]});
    schema.__isDatetime = true;
    return schema;
}

type PreprocessParams = Parameters<typeof ZodEffects['createWithPreprocess']>;
class NcEffects<T extends ZodTypeAny, Output = T['_output'], Input = T['_input']> extends ZodEffects<T, Output, Input> {
    chain<T2 extends ZodTypeAny>(next: (inner: T) => T2) {
        const nextInner = next(this.innerType());
        return new NcEffects({
            ...this._def,
            schema: nextInner,
        });
    }

    static create: typeof ZodEffects['create'] = (schema, effect, params) => {
        const newEffect = super.create(schema, effect, params);
        return new NcEffects(newEffect._def);
    }
    static createWithPreprocess = <I extends ZodTypeAny>(preprocess: PreprocessParams[0], schema: I, params?: PreprocessParams[2]) => {
        const newEffect = super.createWithPreprocess(preprocess, schema, params);
        return new NcEffects(newEffect._def);
    }
}
const preprocess = NcEffects.createWithPreprocess;

export type InputProps = {
    [prop: string]: any
};
export type InputsProps = {
    [inputName: string]: InputProps
};

class IfType extends ZodType {
    #ifClause!: (inputs: InputProps) => boolean;
    #trueType!: ZodTypeAny;
    #falseType!: ZodTypeAny;
    #name: string | undefined;

    constructor(
        ifClause: (inputs: InputProps) => boolean,
        trueType: ZodTypeAny,
        falseType: ZodTypeAny,
        name?: string,
    ) {
        super({});
        this.#name = name;
        this.#ifClause = ifClause;
        this.#trueType = trueType;
        this.#falseType = falseType;
    }

    setName(name: string) {
        this.#name = name;
        return this;
    }

    get TrueType() {
        return this.#trueType;
    }

    get FalseType() {
        return this.#falseType;
    }

    _parse(input: zod.ParseInput): zod.ParseReturnType<any> {
        const data = input.data as InputProps;
        if (!this.#name || !(this.#name in data)) throw new Error('Cannot parse the value');
        input = {
            ...input,
            data: data[this.#name],
        }
        if (this.#ifClause(data)) return this.#trueType._parse(input);
        return this.#falseType._parse(input);
    }
    
}

/**
 * `zod.object` has a problem with `zod.preprocess`: if a property fails to parse then the next properties won't be parsed.
 * So here, we create a simple class to make sure all properties are validated.
 */
export class Schema {
    #shape: ZodRawShape = {};

    constructor(shape: ZodRawShape) {
        this.#shape = shape;
    }

    get shape() {
        return this.#shape;
    }

    extends(shape: ZodRawShape) {
        const newShape: ZodRawShape = {
            ...this.#shape,
        };
        for (let prop in shape) {
            newShape[prop] = shape[prop];
        }
        return new Schema(newShape);
    }

    async validate(objVal: InputProps) {
        const messages: {[prop: string]: string} = {};
        const data: InputProps = {};
        const ifNames: string[] = [];
        for (let prop in this.#shape) {
            const propSchema = this.#shape[prop];
            if (propSchema instanceof IfType) {
                ifNames.push(prop);
                data[prop] = objVal[prop];
            }
            else {
                if (propSchema instanceof ZodBoolean) objVal[prop] = objVal[prop] !== null; 
                const ret = await propSchema.safeParseAsync(objVal[prop]);
                if (ret.success) {
                    data[prop] = ret.data;
                }
                else {
                    messages[prop] = ret.error.issues[0].message;
                }
            }
        }
        for (let prop of ifNames) {
            const ret = await (this.#shape[prop] as IfType).setName(prop).safeParseAsync(data);
            if (ret.success) {
                data[prop] = ret.data;
            }
            else {
                messages[prop] = ret.error.issues[0].message;
            }
        }

        return {
            get success() {
                return Object.keys(messages).length < 1;
            },
            data,
            messages,
        }
    }
}

function localUTC(dt: Date) {
    return new Date(dt.getTime() - dt.getTimezoneOffset() * 60000);
}

/**
 * (Apparently, we cannot set the language for the error message if we rely on the input attributes for validation)
 * 
 * @param name: the input's name
 * @param propType: the data schema which represents the input 
 * @returns: the input atrributes based on its schema
 */
function getInputProps(name: string, propType: ZodTypeAny) {
    const props: InputProps = {
        name,
        required: true,
    };
    
    let fnTrans: () => void;
    const defTrans = () => {
        propType = (propType as ZodDefault<ZodTypeAny>).removeDefault();
    }
    const optTrans = () => {
        propType = (propType as ZodOptional<ZodTypeAny>).unwrap();
        delete props.required;
    }
    const effectTrans = () => {
        propType = (propType as ZodEffects<ZodTypeAny>).sourceType();
    }
    while (
        ((propType instanceof ZodDefault) && (fnTrans = defTrans)) ||
        ((propType instanceof ZodOptional) && (fnTrans = optTrans)) ||
        ((propType instanceof ZodEffects) && (fnTrans = effectTrans))
    ) {
        fnTrans();
    }

    if (propType instanceof ZodString) {
        const type = propType as ZodString;
        
        if (type.isEmail)
            //Needs to note: on browser, local hostname is valid but not for zod. For example: 'abc@localhost'
            props.type = 'email';
        else if (type.isURL)
            props.type = 'url';
        else {
            //props.type = 'text'; // default type (also `select` and `textarea` element don't need it)
            const pattern = type.pattern;
            if (pattern) props.pattern = pattern;
        }

        if (typeof(type.minLength) == 'number') props.minLength = type.minLength;
        if (typeof(type.maxLength) == 'number') props.maxLength = type.maxLength;
    }
    else if (propType instanceof ZodBoolean) {
        props.type = 'checkbox';
        delete props.required;
    }
    else if (propType instanceof ZodNumber) {
        const type = propType as ZodNumber;
        props.type = 'number';
        if (typeof(type.minValue) == 'number') props.min = type.minValue;
        if (typeof(type.maxValue) == 'number') props.max = type.maxValue;
    }
    else if (propType instanceof ZodDate) {
        const type = propType as ZodDate;
        if (type.isDatetime) {
            props.type = 'datetime-local';
            if (type.minDate != null) props.min = localUTC(type.minDate).toISOString().substring(0, 16);
            if (type.maxDate != null) props.max = localUTC(type.maxDate).toISOString().substring(0, 16);
        }
        else {
            props.type = 'date';
            if (type.minDate != null) props.min = localUTC(type.minDate).toISOString().substring(0, 10);
            if (type.maxDate != null) props.max = localUTC(type.maxDate).toISOString().substring(0, 10);
        }

    }
    else if (propType instanceof IfType) {
        delete props.required;
        const trueProps = getInputProps(name, (propType as IfType).TrueType),
              falseProps = getInputProps(name, (propType as IfType).FalseType);
        for (let propName in trueProps) {
            if (trueProps[propName] === falseProps[propName]) props[propName] = trueProps[propName];
        }
    }

    return props;
}

export function getSchemaProps(schema: Schema) {
    const inputsProps: InputsProps = {};
    for (let name in schema.shape) {
        inputsProps[name] = getInputProps(name, schema.shape[name])
    }
    return inputsProps;
}

export async function getSchema(name: string) {
    let schema: Schema | undefined;
    try {
        schema = (await import(/* webpackMode: "eager" */`@/lib/schema/${name}`)).default;
    }
    catch {}
    if (!(schema instanceof Schema)) throw 'Invalid schema name';
    return schema;
}

const {coerce, ..._zod} = zod;
const z = {
    ..._zod,
    ...coerce,
    preprocess,
    // boolean: (params?: Parameters<typeof _zod.boolean>[0]) => preprocess(
    //     val => {
    //         val = val ?? false;
    //         return val !== false;
    //     },
    //     _zod.boolean(params)
    // ),
    date: (params?: Parameters<typeof coerce.date>[0]) => preprocess(
        val => {
            if (val === null) {
                return void(0); //will get message 'Required', except it's optional (will no error)
            }
            else if (typeof(val) == 'boolean' || val instanceof Boolean) {
                return 'Invalid Date';
            }
            else if (typeof(val) == 'string') {
                const sVal = val.trim();
                if (sVal.length == 10) { //possibly a string with format 'yyyy-MM-dd'
                    const dt = new Date(`${sVal}T00:00`); //Adding string 'T00:00' is to make it to be parsed as a local time
                    return isNaN(dt.getDate()) ? sVal /*'Invalid Date'*/ : dt;
                }
                return sVal;
            }
            return val;
        },
        coerce.date(params)
    ),
    number: (params?: Parameters<typeof coerce.number>[0]) => preprocess(
        val => {
            if (val === null || typeof(val) == 'string' && val.trim() == '') {
                return void(0); //will get message 'Required', except it's optional (will no error)
            }
            else if (typeof(val) == 'boolean' || val instanceof Boolean) {
                return NaN;
            }
            return val;
        },
        coerce.number(params)
    ),
    if: (
        ifClause: (inputs: InputProps) => boolean,
        trueType: ZodTypeAny,
        falseType: ZodTypeAny,
        name?: string
    ) => new IfType(ifClause, trueType, falseType, name),
    string: (params?: Parameters<typeof coerce.string>[0]) => preprocess(
        val => {
            if (val === null) {
                return void(0); //will get message 'Required', except it's optional (will no error)
            }
            else if (typeof(val) == 'string') {
                const sVal = val.trim();
                return sVal == '' ? void(0) : sVal;
            }
            return val;
        },
        _zod.string(params)
    ),
    form: (shape: ZodRawShape) => new Schema(shape),
};
export {z};
export default z;