'use client';
/** 
 * https://github.com/atmulyana/nextCart
 **/
import * as React from 'react';
import {useFormStatus} from "react-dom";
import {setRef} from 'reactjs-common';
import {type ContextRef, ValidationContext} from '@react-input-validator/web';
import {useRouter} from 'next/navigation';
import cfg from '@/config/usable-on-client';
import lang from '@/data/lang/client';
import {isPlainObject} from '@/lib/common';
import Loading from './Loading';
import {useNotification, type NotificationParam} from './Notification';

type ActionFunction = (formData: FormData) => any;
type ResponseAction = (response: any, formData: FormData) => any;

export type FormProps = Omit<React.ComponentProps<'form'>, 'action' | 'noValidate'> & {
    action?: string | ActionFunction,
    getResponseMessage?: (response: any) => string | NotificationParam,
    loading?: React.ReactNode,
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
    Omit<FormProps, 'action' | 'loading'> & {action: ResponseAction, validationRef: React.RefObject<ContextRef>}
>(function FormWithFunctionAction(
    {
        action,
        children,
        getResponseMessage = getMessage,
        method,
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
         * see the comment bellow which pertains `checkedInputs.current`
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
                return false;
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
            for (let name in messages) {
                const message = messages[name]?.trim();
                if (message) validationRef.current.setErrorMessage(name, message);
            }
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

export function FormLoading({isLoading = false}: {isLoading?: boolean | (() => boolean)}) {
    const {pending} = useFormStatus();
    if (typeof(isLoading) == 'function') isLoading = isLoading();
    return <Loading isLoading={pending || isLoading} />;
}

const Form = React.forwardRef<HTMLFormElement, FormProps>(function Form(
    {
        action,
        children,
        className,
        getResponseMessage = getMessage,
        loading = <FormLoading />,
        validate,
        onSubmit,
        onSubmitted,
        ...props
    },
    ref
) {
    let fnAction: ResponseAction;

    const ctx = React.useRef<ContextRef>(
        {setErrorMessage(){}, validate(){}} as any
    );
    const _onSubmit = React.useCallback((ev: React.FormEvent<HTMLFormElement>) => {
        if (ctx.current?.validate()) {
            if (typeof(onSubmit) == 'function') onSubmit(ev);
        }
        else {
            ev.preventDefault();
            if (typeof(onSubmitted) == 'function') {
                onSubmitted({
                    message: 'Invalid input(s)',
                    type:'danger',
                    invalidInput: true,
                    data: null,
                });
            }
        }
    }, [onSubmit, onSubmitted]);

    return <ValidationContext ref={ctx}
        errorTextStyle='text-[var(--color-danger)]'
        inputErrorStyle='border-[var(--color-danger)] text-[var(--color-danger)] error'
        lang={lang}
    >{typeof(action) == 'function' ? (
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
    )}</ValidationContext>;
});
export default Form;