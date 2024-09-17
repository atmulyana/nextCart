'use client';
/** 
 * https://github.com/atmulyana/nextCart
 **/
import React from 'react';
import type {InputProps, InputsProps} from '@/lib/schemas';

const defaultGetProps: (name?: string) => InputProps | null = (name?: string) => name && {name} || null;
const ContextProps = React.createContext(defaultGetProps);
const ContextLoading = React.createContext(false);

export default function SchemaContext({
    children,
    inputsProps,
    schemaName,
}: {
    children: React.ReactNode,
    inputsProps: InputsProps | ((schemaName: string) => Promise<InputsProps>),
    schemaName: string,
}) {
    const [props, setProps] = React.useState<InputProps | null>(typeof(inputsProps) == 'function' ? null : inputsProps);
    const [getProps, setGetProps] = React.useState(() => defaultGetProps);

    React.useEffect(() => {
        const _getProps = (name?: string) => props && name && (props[name] || {name}) || null;
        setGetProps(() => _getProps);
    }, [props]);

    React.useEffect(() => {
        if (typeof(inputsProps) == 'function') inputsProps(schemaName).then(props => { setProps(props); });
        else setProps(inputsProps);
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