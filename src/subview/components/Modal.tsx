'use client';
/** 
 * https://github.com/atmulyana/nextCart
 **/
import React from 'react';
import {Modal, type ModalProps} from 'flowbite-react';

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
type TContextMethod = (params?: ConfirmModalProps) => Promise<boolean>;

const defaultContext = {
    resolve: () => {},
}
const ContextValue = React.createContext<TContextValue>(defaultContext);
const ContextMethod = React.createContext<TContextMethod>(() => Promise.resolve(false));

export function ModalContext({children, ...props}: {children: React.ReactNode} & ConfirmModalProps) {
    const [value, setValue] = React.useState<TContextValue>(defaultContext);
    const open = React.useCallback((params?: ConfirmModalProps) => new Promise<boolean>(resolve => {
        setValue({
            ...params,
            resolve,
        });
    }), []);

    return <ContextMethod.Provider value={open}>
        <ContextValue.Provider value={value}>
            {children}
            <ConfirmModal {...props} />
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
    okLabel = 'Confirm',
    okBtnStyle = 'btn-danger',
    cancelLabel = 'Close',
    cancelBtnStyle = 'btn-primary',
    size = 'md',
}: ConfirmModalProps) {
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
    }, [ctx]);
    
    return <Modal show={open} position={ctx.position} size={ctx.size || size} dismissible popup
        onClose={() => {
            setOpen(false);
            if (!ctx.isResolved) doResolve(false);
        }}
    >
        {ctx.title !== '' && <Modal.Header><div className={ctx.titleClass || titleClass}>{ctx.title || title}</div></Modal.Header>}
        <Modal.Body className={`relative ${ctx.bodyClass ?? ''}`}>{
            ctx.content ||
            <div className={ctx.contentClass || contentClass}>
                {content}
            </div>
        }</Modal.Body>
        {(ctx.cancelLabel !== '' || ctx.okLabel !== '') && <Modal.Footer>
            {ctx.cancelLabel !== '' && <button type="button" className={`${ctx.cancelBtnStyle || cancelBtnStyle} mr-auto`}
                onClick={() => {
                    setOpen(false);
                    doResolve(false);
                }}
            >{ctx.cancelLabel || cancelLabel}</button>}
            {ctx.okLabel !== '' && <button type='button' className={`${ctx.okBtnStyle || okBtnStyle} ml-auto`}
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
                }}
            >{ctx.okLabel || okLabel}</button>}
         </Modal.Footer>}
    </Modal>;
});