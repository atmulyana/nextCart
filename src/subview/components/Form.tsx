'use client';
/** 
 * https://github.com/atmulyana/nextCart
 **/
import * as React from 'react';
import {useFormStatus} from "react-dom";
import {useRouter} from 'next/navigation';
import cfg from '@/config/usable-on-client';
import {isPlainObject} from '@/lib/common';
import Loading from './Loading';
import {useNotification, type NotificationParam} from './Notification';

type ActionFunction = (formData: FormData) => any;

export type FormProps = Omit<React.ComponentProps<'form'>, 'action'> & {
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
    Omit<FormProps, 'action' | 'loading'> & { action: (response: any, formData: FormData) => any}
>(function FormWithFunctionAction(
    {
        action,
        children,
        getResponseMessage = getMessage,
        method,
        onSubmitted,
        refreshThreshold,
        ...props
    },
    ref
) {
    const formRef = React.useRef<HTMLFormElement>(null);
    const submitted = React.useRef<typeof onSubmitted>(onSubmitted);
    const preventInvalidEvent = React.useRef(false);
    const [response, formAction] = React.useActionState(action, initFormState);
    const notify = useNotification();
    const router = useRouter();

    React.useEffect(() => {
        submitted.current = onSubmitted;
    }, [onSubmitted]);

    React.useEffect(() => {
        const _ref = formRef.current;
        if (typeof(ref) == 'function') ref(_ref);
        else if (ref) ref.current = _ref;

        if (_ref) {
            let lastTime = 0;
            const invalidHandler = (ev: Event) => {
                //`onSubmitted` handler must be executed only once for a submit action of form but the invalid event occurs for each invalid input.
                //We consider that all invalid events for all inputs inside the form happen in one second for a submit action.
                //So, if an invalid event happens more than one second after the last one then it's because of another submit action.
                if (ev.eventPhase == Event.CAPTURING_PHASE && ev.timeStamp - lastTime > 1000) {
                    lastTime = ev.timeStamp;
                    if (preventInvalidEvent.current) {
                        preventInvalidEvent.current = false;
                    }
                    else {
                        if (typeof(submitted.current) == 'function') {
                            submitted.current({
                                get message() {
                                    return 'Invalid input(s)';
                                },
                                get type(): 'danger' {
                                    return 'danger';
                                },
                                get invalidInput() {
                                    return true;
                                },
                            });
                        }
                    }
                }
            }
            _ref.addEventListener('invalid', invalidHandler, true);
            return () => _ref.removeEventListener('invalid', invalidHandler);
        }
    }, [formRef.current]);
    
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

        if (typeof(submitted.current) == 'function') submitted.current(responseData);
        if (refreshThreshold) {
            const messageTypes: Array<NotificationParam['type']> = ['danger', 'warning', 'success', 'info'];
            if (messageTypes.indexOf(responseData.type) >= messageTypes.indexOf(refreshThreshold)) {
                router.refresh();
            }
        }

        if (formRef.current && isPlainObject(response) && isPlainObject(response.__validation_messages__)) {
            const messages = response.__validation_messages__ as {[name: string]: string};
            let isInputValid = true;
            for (let name in messages) {
                const message = messages[name]?.trim();
                if (message) {
                    const input = formRef.current.elements.namedItem(name);
                    if (input instanceof RadioNodeList) {
                        (input[0] as HTMLInputElement).setCustomValidity(message);
                        isInputValid = false;
                    }
                    else if (input && (input as HTMLInputElement).type != 'hidden') {
                        (input as HTMLInputElement).setCustomValidity(message); //HTMLSelectElement, HTMLTextAreaElement
                        isInputValid = false;
                    }
                    else if (!notification?.message.trim()) {
                        notify(message, 'danger'); //for a form message (the message that is not associated to an input)
                    }
                }
            }
            if (!isInputValid) {
                preventInvalidEvent.current = true;
                formRef.current.reportValidity(); //Show error messages
            }
        }
    }, [response]);

    return <form role='form'{...props} ref={formRef} action={formAction}>
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
        ...props
    },
    ref
) {
    if (typeof(action) == 'function') {
        const fnAction = (_: any, formData: FormData) => typeof(validate) == 'function' ? validate(formData, action) : action(formData);
        return <FormWithFunctionAction
            {...props}
            ref={ref}
            action={fnAction}
            className={`relative ${className}`}
            getResponseMessage={getResponseMessage}
        >
            {children}
            {loading}
        </FormWithFunctionAction>
    }

    return <form role='form'
        {...props}
        ref={ref}
        action={action && action.startsWith('/') && `${cfg.baseUrl}${action}` || action}
        className={`relative ${className}`}
    >
        {children}
        {loading}
    </form>;
});
export default Form;