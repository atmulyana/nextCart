/** 
 * https://github.com/atmulyana/nextCart
 **/
import React from 'react';
import Form, {type FormProps} from '../Form';
import SchemaContext from '../SchemaContext';
import loading from './loading';
import {getSchemaProps, validate} from './validation';

type Props = Omit<FormProps, 'action'> & {
    action: Exclude<FormProps['action'], string | undefined>,
    schemaName: string,
};
type PropsWithRef = Props & {
    formRef: React.Ref<HTMLFormElement>,
};

const InternalForm = React.forwardRef<
    HTMLFormElement,
    Props & {
        inputsProps: React.ComponentProps<typeof SchemaContext>['inputsProps'],
    }
>(function InternalForm(
    {
        children,
        inputsProps,
        schemaName,
        ...props
    },
    ref
) {
    return <SchemaContext inputsProps={inputsProps} schemaName={schemaName}>
        <Form {...props} ref={ref} validate={validate.bind(null, schemaName)} loading={loading}>
            {children}
        </Form>
    </SchemaContext>;
});

async function ServerForm({
    children,
    formRef,
    schemaName,
    ...props
}: PropsWithRef) {
    return <InternalForm {...props} inputsProps={await getSchemaProps(schemaName)} schemaName={schemaName} ref={formRef}>
        {children}
    </InternalForm>;
}

function ClientForm({
    children,
    formRef,
    schemaName,
    ...props
}: PropsWithRef) {
    return <InternalForm {...props} inputsProps={getSchemaProps} schemaName={schemaName} ref={formRef}>
        {children}
    </InternalForm>;
}

const FormWithSchema = React.forwardRef<HTMLFormElement, Props>(function FormWithSchema(props,  ref) {
    const Form = typeof(window) == 'undefined' ? ServerForm : ClientForm;
    return <Form {...props} formRef={ref} />;
});
export default FormWithSchema;