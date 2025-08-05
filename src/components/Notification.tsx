'use client';
/** 
 * https://github.com/atmulyana/nextCart
 **/
import React from 'react';
//import {useRouter} from 'next/navigation';
import {FiAlertCircle, FiCheckCircle, FiInfo, FiXCircle} from 'react-icons/fi';
import {Alert} from 'flowbite-react';

const SHOW_TIME = 3000; //ms

export type NotificationParam = {
    message: string,
    type: 'success' | 'warning' | 'danger' | 'info',
}
type TContextValue = NotificationParam & {isRefresh?: boolean};
type TContextMethod = (
    ...args: [string, NotificationParam['type'], boolean]
           | [string, NotificationParam['type']]
           | [string, boolean]
           | [string]
) => void;

const defaultValue: NotificationParam = {
    message: '',
    type: 'success',
};
const ContextValue = React.createContext<TContextValue>(defaultValue);
const ContextMethod = React.createContext<TContextMethod>(() => {});

export function NotificationContext({children}: {children: React.ReactNode}) {
    const [value, setValue] = React.useState<TContextValue>(defaultValue);
    const notify: TContextMethod = React.useCallback((...args) => {
        let message = args[0],
            type: NotificationParam['type'] = 'danger',
            isRefresh: boolean | undefined;
        if (typeof(args[1]) == 'string') {
            type = args[1];
            isRefresh = args[2];
        }
        else {
            isRefresh = args[1];
        }

        setValue({message, type, isRefresh});
    }, []);
    
    return <ContextMethod.Provider value={notify}>
        <ContextValue.Provider value={value}>
            {children}
            <NotificationBar />
        </ContextValue.Provider>
    </ContextMethod.Provider>;
}

export function useNotification() {
    return React.useContext(ContextMethod);
}

const NotificationIcon = {
    info: FiInfo,
    success: FiCheckCircle,
    warning: FiAlertCircle,
    danger: FiXCircle,
}

const NotificationBar = React.memo(function NotificationBar() {
    //const router = useRouter();
    const timerId = React.useRef<NodeJS.Timeout | null>(null);
    const ctxVal = React.useContext(ContextValue);
    const notify = useNotification();
    const message = ctxVal.message.trim();

    const clearMessage = () => {
        timerId.current = null;
        //const isRefresh = ctxVal.isRefresh;
        if (message != '') notify('', ctxVal.type);
        //if (isRefresh) router.refresh();
    };

    React.useEffect(() => {
        if (message) {
            if (timerId.current !== null) clearTimeout(timerId.current);
            timerId.current = setTimeout(() => {
                clearMessage();
                timerId.current = null;
            }, SHOW_TIME);
        }
    });

    return message ? (
        <div className='fixed w-full h-12 bottom-0 z-[9999]'>
            <Alert
                color={ctxVal.type != 'danger' ? ctxVal.type : 'failure'}
                icon={NotificationIcon[ctxVal.type]}
                onDismiss={clearMessage}
                rounded
            >
                {message}
            </Alert>
        </div>
    ) : null;
});