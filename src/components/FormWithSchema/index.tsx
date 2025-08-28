'use client';
/** 
 * https://github.com/atmulyana/nextCart
 **/
import React from 'react';
import {getSchemaProps} from '@/lib/schemas';
import FormWithoutSchema, {type FormProps} from '../Form';
import SchemaContext from '../SchemaContext';
import schemaLoading from './loading';
import {validate} from './validation';

type Props = Omit<FormProps, 'action'> & {
    action: Exclude<FormProps['action'], string | undefined>,
    Form?: React.ComponentType<FormProps>,
    schemaName: string,
};

const FormWithSchema = React.forwardRef<
    HTMLFormElement,
    Props
>(function InternalForm(
    {
        children,
        Form = FormWithoutSchema,
        loading = schemaLoading,
        schemaName,
        ...props
    },
    ref
) {
    return <SchemaContext inputsProps={getSchemaProps.bind(null, schemaName, true)}>
        <Form {...props} ref={ref} validate={validate.bind(null, schemaName)} loading={loading}>
            {children}
        </Form>
    </SchemaContext>;
});
export default FormWithSchema;