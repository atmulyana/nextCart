/** 
 * https://github.com/atmulyana/nextCart
 **/
import React from 'react';
import {redirect} from 'next/navigation';
import {clearUserSession, getSession} from '@/data/session';

async function logout() {
    "use server";
    await clearUserSession();
    redirect('/admin');
}

export default async function AdminDashboard() {
    const session = await getSession();
    if (!session.userId) redirect('/admin/login');
    return <>
        <h1>Admin Dashboard</h1>
        <form action={logout}>
            <button type='submit' className="btn-outline-primary bg-white">Logout</button>
        </form>
    </>;
}