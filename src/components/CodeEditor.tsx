'use client';
/** 
 * https://github.com/atmulyana/nextCart
 **/
import '@/styles/code-editor.css';
import React from 'react';
import {useFormStatus} from "react-dom";
import {TextArea, type InputRef, type TextAreaRef, type Rules} from '@react-input-validator/web';
import CodeMirror from '@uiw/react-codemirror';
import type {LanguageSupport} from '@codemirror/language';
import {html} from '@codemirror/lang-html';
import {javascript} from '@codemirror/lang-javascript';
import {less as css} from '@codemirror/lang-less';
import {emptyString, extendObject} from 'javascript-common';
import {setRef} from 'reactjs-common';
import darkMode from '@/lib/darkMode';
import {useSchemaProps} from './SchemaContext';
export {css, html, javascript};

type Props<NoValidation extends (boolean | undefined) = false> =
{
    lang: () => LanguageSupport,
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

const CodeEditor = React.forwardRef(function CodeEditor<NoValidation extends boolean | undefined = false>(
    {
        lang,
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
    const [isDark, setDark] = React.useState(false);
    const validationRef = React.useRef<TextAreaRef>(null);

    React.useEffect(() => {
        setDark(darkMode.isDark);
        const darkModeChangeHandler = () => {
            setDark(darkMode.isDark)
        };
        darkMode.addChangeListener(darkModeChangeHandler);
        return () => darkMode.removeChangeListener(darkModeChangeHandler);
    }, []);

    React.useEffect(() => {
        setVal(value);
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

    rows = Math.floor(rows);
    if (rows < 0) rows = 5;
    const height = rows * 1.5 + 5;

    return <div className='flex flex-col code-editor'>
        <CodeMirror
            editable={!pending}
            extensions={[lang()]}
            height={height + 'rem'}
            onChange={setVal}
            theme={isDark ? 'dark' : 'light'}
            value={value}
        />
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
export default CodeEditor;