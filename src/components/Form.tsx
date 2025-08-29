'use client';
/** 
 * https://github.com/atmulyana/nextCart
 **/
import * as React from 'react';
import {useFormStatus} from "react-dom";
import {noop} from 'javascript-common';
import {setRef} from 'reactjs-common';
import {type ContextRef, ValidationContext} from '@react-input-validator/web';
import {useRouter} from 'next/navigation';
import cfg from '@/config/usable-on-client';
import lang from '@/data/lang/client';
import {isPlainObject} from '@/lib/common';
import schemaMessages from '@/lib/schemas/messages';
import Loading from './Loading';
import {useNotification, type NotificationParam} from './Notification';

type ActionFunction = (formData: FormData) => any;
type ResponseAction = (response: any, formData: FormData) => any;
type ValidationRef = Pick<ContextRef, 'setErrorMessage' | 'validate'>;

export type FormProps = Omit<React.ComponentProps<'form'>, 'action' | 'noValidate'> & {
    action?: string | ActionFunction,
    getResponseMessage?: (response: any) => string | NotificationParam,
    loading?: React.ReactNode,
    loadingCallback?: (isLoading: boolean) => any,
    onSubmitted?: (response: {
        readonly type: NotificationParam['type'],
        readonly message?: string,
        readonly invalidInput: boolean,
        readonly data?: any,
    }) => void,
    refreshThreshold?: NotificationParam['type'],
    validate?: (formData: FormData, action: ActionFunction) => any,
};

function getMessage(response: any) {
    let message = '', type: NotificationParam['type'] = 'danger';
    if (isPlainObject(response)) {
        if (typeof(response.message) == 'string') message = response.message;
        if (typeof(response.messageType) == 'string') type = response.messageType;
        // if (!message && isPlainObject(response.__validation_messages__)) {
        //     message = Object.values(response.__validation_messages__)[0] as string;
        //     type = 'danger';
        // }
    }
    return {message, type};
}

const initFormState = {
    ___init___: true,
};
const FormWithFunctionAction = React.forwardRef<
    HTMLFormElement,
    Omit<FormProps, 'action' | 'loading'> & {action: ResponseAction, validationRef: React.RefObject<ValidationRef>}
>(function FormWithFunctionAction(
    {
        action,
        children,
        getResponseMessage = getMessage,
        //eslint-disable-next-line @typescript-eslint/no-unused-vars
        method, //always `POST`
        onSubmit,
        onSubmitted,
        refreshThreshold,
        validationRef,
        ...props
    },
    ref
) {
    const formRef = React.useRef<HTMLFormElement>(null);
    const checkedInputs = React.useRef<NodeListOf<HTMLInputElement | HTMLOptionElement>>(null);
    const [response, formAction] = React.useActionState(action, initFormState);
    const notify = useNotification();
    const router = useRouter();

    const _onSubmit = React.useCallback((ev: React.FormEvent<HTMLFormElement>) => {
        if (onSubmit) onSubmit(ev);
        if (!formRef.current || ev.defaultPrevented) return;
        
        /**
         * It's useful to maintain the checked/selected elements after submitting. For further information.
         * see the comment below which pertains `checkedInputs.current`
         */
        checkedInputs.current = formRef.current.querySelectorAll("input:checked, select option:checked");
    }, [onSubmit]);

    React.useEffect(() => {
        setRef(ref, formRef.current);
    }, [ref]);
    
    React.useEffect(() => {
        if (response === initFormState) return;
        const responseMessage = getResponseMessage(response);
        let notification: NotificationParam | undefined;
        if (typeof(responseMessage) == 'string') {
            notification = {
                message: responseMessage,
                type: 'danger',
            };
        }
        else if (isPlainObject(responseMessage)) {
            notification = responseMessage;
        }
        if (notification) notify(notification.message, notification?.type);
        
        const responseData = {
            get message() {
                return notification?.message;
            },
            get type() {
                return notification?.type ?? 'danger';
            },
            get invalidInput() {
                return response?.invalidInput ?? false;
            },
            data: response,
        };

        if (typeof(onSubmitted) == 'function') onSubmitted(responseData);
        if (refreshThreshold) {
            const messageTypes: Array<NotificationParam['type']> = ['danger', 'warning', 'success', 'info'];
            if (messageTypes.indexOf(responseData.type) >= messageTypes.indexOf(refreshThreshold)) {
                router.refresh();
            }
        }

        if (formRef.current && isPlainObject(response) && isPlainObject(response.__validation_messages__)) {
            const messages = response.__validation_messages__ as {[name: string]: string};
            let isNotify = false;
            for (let name in messages) {
                const message = messages[name]?.trim();
                if (message) {
                    isNotify = true;
                    validationRef.current.setErrorMessage(name, message);
                }
            }
            if (isNotify) notify(lang(schemaMessages.invalidInputs), 'danger');
        }

        if (checkedInputs.current) {
            /**
             * After invoking the server action (submitting the form to the server), all checked/selected 
             * elements in the form will unchecked/unselected. It's not a problem if the page's content changes
             * as a response of the submitting action. However, if the should stay, for example, because there
             * is one or more invalid inputs, all inputs that the user has just filled must be kept intact. The
             * following statements keep all checked/selected elements before unchanged.
             */
            checkedInputs.current.forEach(node => {
                if (node.tagName == 'INPUT') (node as HTMLInputElement).checked = true;
                else (node as HTMLOptionElement).selected = true;
            });
            checkedInputs.current = null;
        }
    //eslint-disable-next-line react-hooks/exhaustive-deps
    }, [response]);

    return <form role='form' {...props} ref={formRef} action={formAction} noValidate onSubmit={_onSubmit}>
        {children}
    </form>;
});

const FormContext = React.createContext<{
    readonly id?: string,
    readonly loadingCallback: (isLoading: boolean) => any,
    readonly validation: ContextRef | null,
    showLoading?: () => {
        ready: (callback: (value: any) => any) => void,
        stop: () => void, 
    }
}>({
    loadingCallback: noop,
    validation: null,
});

export function useFormContext() {
    return React.useContext(FormContext);
}

export function FormLoading({isLoading = false}: {isLoading?: boolean | (() => boolean)}) {
    const formCtx = useFormContext();
    const {pending} = useFormStatus();
    const [load, setLoad] = React.useState<((value: any) => void) | null>(null);

    if (typeof(isLoading) == 'function') isLoading = isLoading();
    isLoading = isLoading || pending || !!load;

    React.useEffect(() => {
        if (load) load(true);
        formCtx.loadingCallback(isLoading);
    //eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isLoading, formCtx]);

    React.useEffect(() => {
        formCtx.showLoading = () => {
            const p = new Promise(resolve => {
                setLoad(() => resolve);
            });
            return {
                ready: callback => {
                    p.then(callback);
                },
                stop: () => {
                    setLoad(null);
                }
            }
        };
    }, [formCtx]); //`formCtx` never changes

    return <Loading isLoading={isLoading} />;
}

const Form = React.forwardRef<HTMLFormElement, FormProps>(function Form(
    {
        action,
        children,
        className,
        getResponseMessage = getMessage,
        loading = <FormLoading />,
        loadingCallback,
        validate,
        onSubmit,
        onSubmitted,
        ...props
    },
    ref
) {
    const notify = useNotification();
    let fnAction: ResponseAction;
    
    const notifyLoading = React.useRef<NonNullable<typeof loadingCallback>>(noop);
    const ctx = React.useRef<ContextRef>(
        {setErrorMessage(){}, validate(){}} as any
    );
    const formCtx = React.useRef({
        get id() {
            return props.id;
        },
        get loadingCallback() {
            return notifyLoading.current;
        },
        get validation() {
            if ('getInput' in ctx.current) return ctx.current;
            return null;
        }
    });

    React.useEffect(() => {
        notifyLoading.current = (isLoading: boolean) => loadingCallback && loadingCallback(isLoading);
    }, [loadingCallback]);
    
    const _onSubmit = React.useCallback((ev: React.FormEvent<HTMLFormElement>) => {
        if (ctx.current.validate()) {
            if (typeof(onSubmit) == 'function') onSubmit(ev);
        }
        else {
            ev.preventDefault();
            notify(lang(schemaMessages.invalidInputs), 'danger');
            if (typeof(onSubmitted) == 'function') {
                onSubmitted({
                    message: 'Invalid input(s)',
                    type:'danger',
                    invalidInput: true,
                    data: null,
                });
            }
        }
    //eslint-disable-next-line react-hooks/exhaustive-deps
    }, [onSubmit, onSubmitted]);

    return <ValidationContext ref={ctx}
        errorTextStyle='text-[var(--color-danger)]'
        inputErrorStyle='border-[var(--color-danger)] text-[var(--color-danger)] error'
        lang={lang}
    >
        <FormContext.Provider value={formCtx.current}>
        {typeof(action) == 'function' ? (
            fnAction = (_: any, formData: FormData) => typeof(validate) == 'function'
                ? validate(formData, action) : action(formData),
            <FormWithFunctionAction
                {...props}
                ref={ref}
                action={fnAction}
                className={`relative ${className}`}
                getResponseMessage={getResponseMessage}
                onSubmit={_onSubmit}
                onSubmitted={onSubmitted}
                validationRef={ctx}
            >
                {children}
                {loading}
            </FormWithFunctionAction>
        ) : (
            <form role='form'
                {...props}
                ref={ref}
                action={action && action.startsWith('/') && `${cfg.baseUrl}${action}` || action}
                className={`relative ${className}`}
                noValidate
                onSubmit={_onSubmit}
            >
                {children}
                {loading}
            </form>
        )}
        </FormContext.Provider>
    </ValidationContext>;
});
export default Form;