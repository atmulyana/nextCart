/** 
 * https://github.com/atmulyana/nextCart
 **/
import * as React from 'react';
import Form, {type FormProps} from '../Form';
import SchemaContext from '../SchemaContext';
import {getSchemaProps, validate} from './validation';
import {FormLoading} from './Loading';

const FormWithSchema = React.forwardRef<
    HTMLFormElement,
    Omit<FormProps, 'action'> & {
        action: Exclude<FormProps['action'], string | undefined>,
        schemaName: string,
    }
>(function FormWithSchema(
    {
        action,
        children,
        schemaName,
        ...props
    },
    ref
) {
    return <SchemaContext inputsProps={getSchemaProps} schemaName={schemaName}>
        <Form {...props} ref={ref} action={action} validate={validate.bind(null, schemaName)} loading={<FormLoading />}>
            {children}
        </Form>
    </SchemaContext>;
});
export default FormWithSchema;