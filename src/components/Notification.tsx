'use client';
/** 
 * https://github.com/atmulyana/nextCart
 **/
import React from 'react';
import {FiAlertCircle, FiCheckCircle, FiInfo, FiXCircle} from 'react-icons/fi';
import {Alert} from 'flowbite-react';

const SHOW_TIME = 3000; //ms

export type NotificationParam = {
    message: string,
    type: 'success' | 'warning' | 'danger' | 'info',
}
type TContextMethod = (
    message: NotificationParam['message'],
    type: NotificationParam['type']
) => void;

const defaultValue: NotificationParam = {
    message: '',
    type: 'success',
};
const ContextValue = React.createContext<NotificationParam>(defaultValue);
const ContextMethod = React.createContext<TContextMethod>(() => {});

export function NotificationContext({children}: {children: React.ReactNode}) {
    const [value, setValue] = React.useState<NotificationParam>(defaultValue);
    const notify: TContextMethod = React.useCallback((message, type = 'danger') => {
        setValue({message, type});
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
    const timerId = React.useRef<NodeJS.Timeout | null>(null);
    const ctxVal = React.useContext(ContextValue);
    const notify = useNotification();
    const message = ctxVal.message.trim();
    const className = message ? '' : ' hidden';

    const clearMessage = () => {
        if (message != '') notify('', ctxVal.type);
        timerId.current = null;
    };

    React.useEffect(() => {
        if (className == '') {
            if (timerId.current !== null) clearTimeout(timerId.current);
            timerId.current = setTimeout(() => {
                clearMessage();
                timerId.current = null;
            }, SHOW_TIME);
        }
    });
    return <div className={`fixed w-full h-12 bottom-0 z-[9999]${className}`}>
        <Alert
            color={ctxVal.type != 'danger' ? ctxVal.type : 'failure'}
            icon={NotificationIcon[ctxVal.type]}
            onDismiss={clearMessage}
            rounded
        >
            {message}
        </Alert>
    </div>;
});