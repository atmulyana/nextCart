'use client';
/** 
 * https://github.com/atmulyana/nextCart
 **/
import React from 'react';
import {Modal, ModalBody, ModalFooter, ModalHeader, type ModalProps} from 'flowbite-react';
import {noop} from 'javascript-common';

type ConfirmModalProps = {
    title?: string,
    titleClass?: string,
    bodyClass?: string,
    content?: React.ReactNode,
    contentClass?: string,
    okLabel?: string,
    okBtnStyle?: string,
    cancelLabel?: string,
    cancelBtnStyle?: string,
    position?: ModalProps['position'],
    size?: ModalProps['size'],
    onOk?: (btnOk: HTMLButtonElement) => any,
};
type TContextValue = ConfirmModalProps & {
    close?: (returnValue: boolean) => void,
    resolve: (ok: boolean) => void,
    isResolved?: boolean,
};
type TContextMethod = {
    (params?: ConfirmModalProps): Promise<boolean>,
    setLoading: (isLoading: boolean) => any,
};

const defaultContext = {
    resolve: () => {},
}
const ContextValue = React.createContext<TContextValue>(defaultContext);
const defaultMethod: TContextMethod = () => Promise.resolve(false);
defaultMethod.setLoading = noop;
const ContextMethod = React.createContext<TContextMethod>(defaultMethod);

export function ModalContext({children, ...props}: {children: React.ReactNode} & ConfirmModalProps) {
    const [loading, setLoading] = React.useState(false);
    const [value, setValue] = React.useState<TContextValue>(defaultContext);
    //@ts-expect-error
    const open: TContextMethod = React.useCallback((params?: ConfirmModalProps) => new Promise<boolean>(resolve => {
        setValue({
            ...params,
            resolve,
        });
    }), []);
    open.setLoading = setLoading;

    return <ContextMethod.Provider value={open}>
        <ContextValue.Provider value={value}>
            {children}
            <ConfirmModal {...props} loading={loading} />
        </ContextValue.Provider>
    </ContextMethod.Provider>;
}

export function useModal() {
    return React.useContext(ContextMethod);
}

export function useToCloseModal() {
    const ctx = React.useContext(ContextValue);
    const close = React.useCallback((returnValue: boolean = true) => {
        ctx.close?.(returnValue);
    }, [ctx]);
    return close;
}

const ConfirmModal = React.memo(function ConfirmModal({
    title = 'Confirm',
    titleClass='px-4',
    content = 'Are you sure you want to proceed?',
    contentClass='space-y-6 px-6',
    loading,
    okLabel = 'Confirm',
    okBtnStyle = 'btn-danger',
    cancelLabel = 'Close',
    cancelBtnStyle = 'btn-primary',
    size = 'md',
}: ConfirmModalProps & {
    loading?: boolean
}) {
    const [open, setOpen] = React.useState(false);
    const ctx = React.useContext(ContextValue);

    const doResolve = (ok: boolean) => {
        ctx.resolve(ok);
        ctx.isResolved = true;
    }

    React.useEffect(() => {
        if (ctx != defaultContext) {
            setOpen(true);
            ctx.close = (returnValue: boolean) => {
                setOpen(false);
                doResolve(returnValue);
            };
        }
    //eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ctx]);
    
    return <Modal show={open} position={ctx.position} size={ctx.size || size} dismissible={!loading} popup
        onClose={() => {
            if (loading) return;
            setOpen(false);
            if (!ctx.isResolved) doResolve(false);
        }}
    >
        {ctx.title !== '' && <ModalHeader><div className={ctx.titleClass || titleClass}>{ctx.title || title}</div></ModalHeader>}
        <ModalBody className={`relative ${ctx.bodyClass ?? ''}`}>{
            ctx.content ||
            <div className={ctx.contentClass || contentClass}>
                {content}
            </div>
        }</ModalBody>
        {(ctx.cancelLabel !== '' || ctx.okLabel !== '') && <ModalFooter>
            {ctx.cancelLabel !== '' && <button type="button"
                className={`${ctx.cancelBtnStyle || cancelBtnStyle} mr-auto`}
                disabled={loading}
                onClick={() => {
                    setOpen(false);
                    doResolve(false);
                }}
            >{ctx.cancelLabel || cancelLabel}</button>}
            {ctx.okLabel !== '' && <button type='button'
                className={`${ctx.okBtnStyle || okBtnStyle} ml-auto`}
                disabled={loading}
                onClick={async (e) => {
                    let isOk = true;
                    if (typeof(ctx.onOk) == 'function') {
                        let ok = ctx.onOk(e.target as HTMLButtonElement);
                        if (ok instanceof Promise) ok = await ok;
                        if (ok === false) isOk = false;
                    }
                    if (isOk) {
                        setOpen(false);
                        doResolve(true);
                    }
                    else {
                        e.preventDefault();
                    }
                }}
            >{ctx.okLabel || okLabel}</button>}
         </ModalFooter>}
    </Modal>;
});