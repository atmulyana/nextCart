/** 
 * https://github.com/atmulyana/nextCart
 **/
import React from 'react';
import {redirect} from 'next/navigation';
import {clearUserSession} from '@/data/session';
import {updateSession} from '@/lib/auth';

async function logout() {
    "use server";
    await updateSession({user: null});
    await clearUserSession();
    redirect('/admin');
}

export default async function AdminDashboard() {
    return <>
        <h1>Admin Dashboard</h1>
        <form action={logout}>
            <button type='submit' className="btn-outline-primary bg-white">Logout</button>
        </form>
    </>;
}