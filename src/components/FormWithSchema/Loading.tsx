'use client';
/** 
 * https://github.com/atmulyana/nextCart
 **/
import React from 'react';
import {useFormStatus} from "react-dom";
import {useSchemaLoadig} from '../SchemaContext';
import Loading from '../Loading';

export function FormLoading() {
    const {pending: isFormLoading} = useFormStatus();
    const isSchemaLoading = useSchemaLoadig();
    return <Loading isLoading={isFormLoading || isSchemaLoading} />;
}