'use client';
/** 
 * https://github.com/atmulyana/nextCart
 **/
import React from 'react';
import {alwaysValid} from '@react-input-validator/rules';
import type {InputProps, InputsProps} from '@/lib/schemas';

const defaultGetProps: (name?: string) => InputProps = (name?: string) => ({name, rules: alwaysValid});
const ContextProps = React.createContext(defaultGetProps);
const ContextLoading = React.createContext(false);

export default function SchemaContext({
    children,
    inputsProps,
}: {
    children: React.ReactNode,
    inputsProps: () => Promise<InputsProps>,
}) {
    const [props, setProps] = React.useState<InputsProps | null>(null);
    const [getProps, setGetProps] = React.useState(() => defaultGetProps);

    React.useEffect(() => {
        const _getProps = (name?: string): InputProps => props && name && props[name] || defaultGetProps(name);
        setGetProps(() => _getProps);
    }, [props]);

    React.useEffect(() => {
        inputsProps().then(props => { 
            setProps(props);
        });
    }, [inputsProps]);
    
    return <ContextLoading.Provider value={props == null}>
        <ContextProps.Provider value={getProps}>{children}</ContextProps.Provider>
    </ContextLoading.Provider>;
}

export function useSchemaLoadig() {
    return React.useContext(ContextLoading);
}

export function useSchemaProps() {
    return React.useContext(ContextProps);
}