'use client';
/** 
 * https://github.com/atmulyana/nextCart
 * 
 * We don't use `SessionProvider` component from 'next-auth/react' because of avoiding the round-trip
 * process to update the session context
 **/
import React from 'react';
import type {Session} from 'next-auth';
import {useNotification} from './Notification';

const defaultContextValue = {
    id: '',
    customerPresent: false,
    expires: ''
};
const Context = React.createContext<Session>(defaultContextValue);

var setContextValue!: (value: Partial<Session>) => void;

export function SessionProvider({children}: {children: React.ReactNode}) {
    const [value, setValue] = React.useState<Session>(defaultContextValue);
    setContextValue = (newFieldValues: Partial<Session>) => {
        setValue({
            ...value,
            ...newFieldValues,
        });
    };

    return <Context.Provider value={value}>
        {children}
    </Context.Provider>;
}

export function SessionUpdater({value}: {value: Partial<Session> | null}) {
    const notify = useNotification();
    React.useEffect(() => {
        setContextValue && setContextValue(value ?? defaultContextValue);
        if (value?.message) notify(value.message, value.messageType ?? 'danger', true);
    //eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value]);
    return null;
}

export function useSession() {
    return React.useContext(Context);
}