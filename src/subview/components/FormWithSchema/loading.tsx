'use client';
/** 
 * https://github.com/atmulyana/nextCart
 **/
import React from 'react';
import {FormLoading} from '../Form';
import {useSchemaLoadig} from '../SchemaContext';

export default <FormLoading isLoading={() => useSchemaLoadig()} />;