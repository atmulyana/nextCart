'use client';
/** 
 * https://github.com/atmulyana/nextCart
 **/
import React from 'react';
import type {TSessionCustomer, TSessionUser} from '@/data/types';

type ContextValue = Omit<TSessionCustomer & TSessionUser, '_id' | 'customerId' | 'userId'> & {
    customerPresent: boolean,
    userPresent: boolean,
};


const defaultContextValue = {
    customerPresent: false,
    userPresent: false,
};
const Context = React.createContext<ContextValue>(defaultContextValue);

var setContextValue!: (value: Partial<ContextValue>) => void;

function SessionContext({children}: {children: React.ReactNode}) {
    const [value, setValue] = React.useState<ContextValue>(defaultContextValue);
    setContextValue = (newFieldValues: Partial<ContextValue>) => {
        setValue({
            ...value,
            ...newFieldValues,
        });
    };

    return <Context.Provider value={value}>
        {children}
    </Context.Provider>;
}
export default SessionContext;

export function SessionUpdater({value}: {value: Partial<ContextValue>}) {
    React.useEffect(() => {
        setContextValue && setContextValue(value);
    }, [value]);
    return null;
}

export function useSession() {
    return React.useContext(Context);
}