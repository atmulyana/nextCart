'use client';
/** 
 * https://github.com/atmulyana/nextCart
 **/
import React, {type FocusEventHandler, type KeyboardEventHandler, type MouseEventHandler} from 'react';
import {emptyString} from 'javascript-common';
import {setRef} from 'reactjs-common';
import type {InputRef, SelectProps} from '@react-input-validator/web';
import Select from './SubmittedSelect';

type BaseProps<NoValidation extends (boolean | undefined)> = {
    name?: string,
    noValidation?: NoValidation,
    onChange?: (newValue: string[]) => any,
    value?: string[],
};
type ValidationProps = {
    settings?: SelectProps['settings'],
    rules?: SelectProps['rules'],
};
type Props<NoValidation extends (boolean | undefined)> = NoValidation extends true 
    ? BaseProps<NoValidation>
    : BaseProps<NoValidation> & ValidationProps

const emptyArray: any[] = [];
const invalidChars = /[^\w'-]/u;
const separators = /[ ,;]/;
const buzzedDuration = 1500;

function selectStartHandler(ev: Event) {
    ev.preventDefault();
    return false;
}

function Item({
    arefCallback,
    buzzed,
    onBlur,
    onClick,
    onFocus,
    onKeyDown,
    word,
}: {
    arefCallback: (aref: HTMLAnchorElement | null) => any,
    buzzed?: boolean,
    onBlur: FocusEventHandler<HTMLAnchorElement>,
    onClick: MouseEventHandler<HTMLDivElement>,
    onFocus: FocusEventHandler<HTMLAnchorElement>,
    onKeyDown: KeyboardEventHandler<HTMLElement>,
    word: string,
}) {
    const a = React.useRef<HTMLAnchorElement>(null);

    React.useEffect(() => {
        if (a.current) a.current.parentElement?.addEventListener('selectstart', selectStartHandler);
        arefCallback(a.current);
    }, emptyArray);

    return <div
        aria-label={word}
        className={`flex flex-none border-solid border-2 rounded-sm px-1 py-0.5 h-auto leading-none
            ${buzzed ? 'animate-ping border-[var(--color-warning)]' : 'border-gray-200 dark:border-gray-800'}
            bg-gray-200 dark:bg-gray-800 has-focus:border-blue-500`}
        onClick={onClick}
        onKeyDown={onKeyDown}
    >
        <span>{word}</span>
        <a ref={a} href='#'
            className='m-0 ml-1.5 font-extrabold outline-0 noline'
            onBlur={onBlur}
            onFocus={onFocus}
        >x</a>
    </div>;
}

const InternalKeywords = React.memo(function WordList({
    $ref,
    name,
    noValidation,
    onChange,
    settings,
    rules,
    value = emptyArray
}: BaseProps<boolean> & ValidationProps & {$ref?: React.Ref<InputRef>}) {
    const input = React.useRef<HTMLInputElement>(null);
    const arefs = React.useRef<{[key: string]: HTMLAnchorElement | null}>({});
    const [words, setWords] = React.useState<{[key: string]: string}>({});
    const [selected, setSelected] = React.useState(emptyString);
    const [buzzedItems, setBuzzedItems] = React.useState<string[]>(emptyArray);

    React.useEffect(() => {
        const vals: {[key: string]: string} = {};
        if (value) {
            for (let val of value) vals[val.toLocaleLowerCase()] = val;
        }
        setWords(vals);
    }, [value]);

    const values = Object.values(words);
    React.useEffect(() => {
        if (onChange) onChange(values);
    }, [words, onChange]);

    React.useEffect(() => {
        arefs.current[selected]?.focus();
    });

    const getPrev = (key: string) => {
        if (!key) return getLast();
        const keys = Object.keys(words);
        const i = keys.indexOf(key);
        if (i < 1) return emptyString;
        return keys[i - 1]; 
    };
    const getNext = (key: string) => {
        const keys = Object.keys(words);
        const i = keys.indexOf(key);
        if (i < 0 || i > keys.length - 1) return emptyString;
        return keys[i + 1]; 
    };
    const getFirst = () => Object.keys(words)[0] ?? emptyString;
    const getLast = () => {
        const keys = Object.keys(words);
        if (keys.length < 1) return emptyString;
        return keys[keys.length - 1];
    }
    const remove = (key: string) => {
        if (!key) return ;
        setWords(words => {
            const {[key]: removed, ...newWords} = words;
            return newWords;
        });
    };
    const setFocus = (key: string, inputFocus = true) => {
        if (key) setSelected(key);
        else if (inputFocus) input.current?.focus();
    };
    const keyDownHandler: KeyboardEventHandler<HTMLElement> = ev => {
        const inp = ev.target as HTMLInputElement; //Not really `input` element, may be `a` element
        const tag = inp.tagName;
        
        if (ev.key == 'ArrowLeft' || ev.key == 'Left') {
            const prev = getPrev(selected);
            if (tag != 'INPUT' || inp.selectionStart == inp.selectionEnd && inp.selectionStart == 0)
                setFocus(prev, false);
        }
        else if (ev.key == 'ArrowRight' || ev.key == 'Right') {
            const next = getNext(selected);
            setFocus(next);
        }
        else if (ev.key == 'Backspace') {
            const prev = getPrev(selected);
            if (tag != 'INPUT') {
                remove(selected);
            }
            else if (inp.selectionStart != inp.selectionEnd || inp.selectionStart != 0) {
                 //if `<input />` with a selection or the cursor position not at the left-most then do nothing
                return;
            }
            setFocus(prev);
        }
        else if (ev.key == 'Delete' || ev.key == 'Del') {
            const next = getNext(selected);
            remove(selected);
            setFocus(next);
        }
        else if (ev.key == 'End') {
            if (Object.keys(words).length > 0) ev.preventDefault();
            setFocus(getLast());
        }
        else if (ev.key == 'Home') {
            if (Object.keys(words).length > 0) ev.preventDefault();
            setFocus(getFirst());
        }
        else if (tag == 'INPUT' && ev.key.length == 1) {
            if (separators.test(ev.key)) {
                ev.preventDefault();
                if (inp.selectionEnd == inp.value.length) { //the cursor positions after the last char
                    const newWord = inp.value.substring(0, inp.selectionStart ?? inp.value.length);
                    if (newWord != emptyString) {
                        const key = newWord.toLocaleLowerCase();
                        if (words[key]) {
                            setBuzzedItems(items => [...items, key]);
                            setTimeout(() => {
                                setBuzzedItems(items => items.filter(item => item != key));
                            }, buzzedDuration);
                        }
                        else {
                            setWords(words => ({
                                ...words,
                                [key]: newWord
                            }));
                        }
                    }
                    inp.value = emptyString;
                }
            }
            else if (invalidChars.test(ev.key)) {
                ev.preventDefault();
            }
        }
    }

    return <div> 
        <div className='form-input !flex flex-wrap gap-1 !h-auto'>
            {Object.keys(words).map(key => <Item
                key={key}
                arefCallback={ref => arefs.current[key] = ref}
                buzzed={buzzedItems.includes(key)}
                onBlur={() => setSelected(() => emptyString)}
                onClick={ev => {
                    ev.preventDefault();
                    if ((ev.target as HTMLElement).tagName == 'A') remove(key);
                    else setSelected(key);
                }}
                onFocus={() => setSelected(() => key)}
                onKeyDown={keyDownHandler}
                word={words[key]}
            />)}
            <input ref={input} type='text' onKeyDown={keyDownHandler}
                className='flex-1 border-solid border-2 p-0.5 border-transparent bg-transparent h-auto leading-none min-w-9'
            />
        </div>
        <Select
            ref={(ref: any) => {
                if ($ref) setRef($ref, ref);
            }} 
            className='hidden'
            multiple
            name={name}
            noValidation={noValidation}
            //@ts-expect-error
            settings={settings}
            rules={rules}
            value={values}
        >
            {values.map(word => <option key={word} value={word} />)}
        </Select>
    </div>;
},
    (prevProps, nextProps) => Object.is(prevProps.noValidation, nextProps.noValidation)
        && Object.is(prevProps.onChange, nextProps.onChange)
        && Object.is(prevProps.rules, nextProps.rules)
        && Object.is(prevProps.value, nextProps.value)
        && Object.is(prevProps.$ref, nextProps.$ref)
);

const Keywords = React.forwardRef(function WordList<NoValidation extends (boolean | undefined) = false>(
    props: Props<NoValidation>,
    ref: React.Ref<InputRef>
) {
    return <InternalKeywords {...props} $ref={ref} />;
});
Keywords.displayName = 'Keywords';

export default Keywords;