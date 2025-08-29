'use client';
/** 
 * https://github.com/atmulyana/nextCart
 **/
import '@/styles/_variables.scss';                                       
import '@/styles/_keyframe-animations.scss';
import '@/styles/html-editor.css';
import React from 'react';
import {useFormStatus} from "react-dom";
import {TextArea, type InputRef, type TextAreaRef, type Rules} from '@react-input-validator/web';
import {emptyString, extendObject} from 'javascript-common';
import {setRef} from 'reactjs-common';
import TiptapEditor, {type Editor} from './tiptap-templates/simple/simple-editor';
import {useSchemaProps} from './SchemaContext';

type Props<NoValidation extends (boolean | undefined) = false> =
{
    name?: string,
    noValidation?: NoValidation,
    rows?: number,
    value?: string,
} & (
    NoValidation extends true
        ? {
            rules?: Rules,
        }
        : {
            rules?: undefined,
        }
);
type TRef = {
    readonly name: string,
    readonly value: string,
};
type Ref<NoValidation extends (boolean | undefined)> = NoValidation extends true
    ? React.Ref<TRef>
    : React.Ref<TRef & InputRef>;

const HtmlEditor = React.forwardRef(function HtmlEditor<NoValidation extends boolean | undefined = false>(
    {
        name,
        noValidation,
        value,
        rows = 5,
        rules,
    }: Props<NoValidation>,
    ref: Ref<NoValidation>
) {
    const {pending} = useFormStatus();
    const getProps = useSchemaProps();
    const validationProps = getProps(name);
    const [val, setVal] = React.useState(value);
    const validationRef = React.useRef<TextAreaRef>(null);

    const editor = React.useRef<Editor>(null);
    //Using `refCallback` because `editor` ref is set after mounting (The first call of `useEffect(...., [value])`)
    const editorRefCallback = React.useCallback((ref: Editor | null) => {
        editor.current = ref;
        if (ref) ref.commands.setContent(val ?? emptyString);
    //eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    const onUpdate = React.useCallback((editor: Editor) => {
        setVal(editor.getHTML());
    }, []);
    React.useEffect(() => {
        setVal(value);
        if (editor.current) editor.current.commands.setContent(value ?? emptyString);
    }, [value]);
    
    React.useEffect(() => {
        const obj = {
            get name() {
                return name ?? emptyString;
            },
            get value() {
                return val ?? emptyString;
            }
        };
        setRef(
            ref, 
            noValidation
                ? obj
                : extendObject(obj, validationRef.current as InputRef)
        );
    }, [ref, noValidation, name, val]);

    React.useEffect(() => {
        if (editor.current) editor.current.setEditable(!pending);
    }, [pending]);

    rows = Math.floor(rows);
    if (rows < 0) rows = 5;
    const height = rows * 1.5 + 5;

    return <div className='flex flex-col html-editor' style={{height: height + 'rem'}}>
        <TiptapEditor ref={editorRefCallback} onUpdate={onUpdate} />
        {noValidation
            ? <textarea
                className='hidden'
                name={name}
                onChange={ev => setVal(ev.target.value)}
                value={val}
            />
            : <TextArea
                {...validationProps}
                rules={validationProps.rules ?? rules}
                style='hidden'
                ref={validationRef}
                value={val}
            />
        }
    </div>;
}) as (
    <NoValidation extends (boolean | undefined) = false>(
        props: Props<NoValidation> & {ref?: Ref<NoValidation>, key?: React.Key | null}
    ) => React.ReactNode
);
export default HtmlEditor;