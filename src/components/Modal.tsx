'use client';
/** 
 * https://github.com/atmulyana/nextCart
 **/
import React from 'react';
import {Modal, type ModalProps} from 'flowbite-react';

type ConfirmModalProps = {
    title?: string,
    content?: React.ReactNode,
    okLabel?: string,
    okBtnStyle?: string,
    cancelLabel?: string,
    cancelBtnStyle?: string,
    size?: ModalProps['size'],
    onOk?: (btnOk: HTMLButtonElement) => any,
};
type TContextValue = ConfirmModalProps & {
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

const ConfirmModal = React.memo(function ConfirmModal({
    title = 'Confirm',
    content = 'Are you sure you want to proceed?',
    okLabel = 'Confirm',
    okBtnStyle = 'btn-danger',
    cancelLabel = 'Close',
    cancelBtnStyle = 'btn-primary',
    size = 'md',
}: ConfirmModalProps) {
    const [open, setOpen] = React.useState(false);
    const ctx = React.useContext(ContextValue);

    React.useEffect(() => {
        if (ctx != defaultContext) setOpen(true);
    }, [ctx]);
    
    const doResolve = (ok: boolean) => {
        ctx.resolve(ok);
        ctx.isResolved = true;
    }

    return <Modal show={open} size={ctx.size || size} dismissible popup
        onClose={() => {
            setOpen(false);
            if (!ctx.isResolved) doResolve(false);
        }}
    >
        {ctx.title !== '' && <Modal.Header><div className='px-4'>{ctx.title || title}</div></Modal.Header>}
        <Modal.Body>{ctx.content ||
            <div className="space-y-6 px-6">
                {content}
            </div>}
        </Modal.Body>
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