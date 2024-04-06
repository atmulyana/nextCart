/** 
 * https://github.com/atmulyana/nextCart
 **/
import React from 'react';
import {redirect} from 'next/navigation';
import {getSession} from '@/data/session';

export default async function CustomerAccount() {
    const session = await getSession();
    if (!session.customerPresent) redirect('/customer/login');
    return <h1>My Account Page</h1>;
}