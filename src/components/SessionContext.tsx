'use client';
/** 
 * https://github.com/atmulyana/nextCart
 * 
 * We don't use `SessionProvider` component from 'next-auth/react' because of avoiding the round-trip
 * process to update the session context
 **/
import React from 'react';
import type {Session} from 'next-auth';
import {isPlainObject} from '@/lib/common';
import {useCart} from './Cart';
import Loading from './Loading';
import {useNotification} from './Notification';

const defaultContextValue = {
    id: '',
    customerPresent: false,
    expires: ''
};
const Context = React.createContext<Session>(defaultContextValue);

let setContextValue!: (value: Partial<Session>) => void;

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

function InternalSessionUpdater({value}: {value: Partial<Session> | null}) {
    const cart = useCart();
    const notify = useNotification();
    React.useEffect(() => {
        if ((value?.customer?.chartItemCount ?? 0) < 1 && cart.totalCartItems > 0) {
            cart.reset();
        }
        if (setContextValue) setContextValue(value ?? defaultContextValue);
        if (value?.message) notify(value.message, value.messageType ?? 'danger', true);
    //eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value]);
    return null;
}

export function SessionUpdater({
    children,
    isDirty,
    value,
}: {
    children: React.ReactNode,
    isDirty: boolean,
    value: Partial<Session> | null,
}) {
    const [state, setState] = React.useState<{
        isDirty: boolean,
        value: typeof value
    }>({isDirty, value});
    
    let doUpdate: Promise<typeof value> | null = null;
    if (state.isDirty && typeof(location) != 'undefined') {
        doUpdate = fetch(`/token__Refresh__/9/3/1?t=${new Date().getTime()}`)
            .then<Session | null>(response => response.json());
    };
    
    return <React.Suspense fallback={<Loading isLoading noBackdrop />}>
        <TokenUpdater doUpdate={doUpdate} setState={setState}>
            {children}
            <InternalSessionUpdater value={state.value} />
        </TokenUpdater>
    </React.Suspense>;
}

function TokenUpdater({
    children,
    doUpdate,
    setState,
}: {
    children: React.ReactNode,
    doUpdate: Promise<Partial<Session> | null> | null,
    setState: (state: {isDirty: boolean, value: Partial<Session> | null}) => void,
}) {
    let session: Partial<Session> | null | undefined;
    if (doUpdate) {
        session = React.use(doUpdate);
    }

    React.useEffect(() => {
        if (session === null || isPlainObject(session)) setState({
            isDirty: false,
            value: session as any,
        });
    //eslint-disable-next-line react-hooks/exhaustive-deps
    }, [session]);

    return children;
}

export function useSession() {
    return React.useContext(Context);
}