/** 
 * https://github.com/atmulyana/nextCart
 **/
import React from 'react';
import {POST} from '@/app/admin/logout/route';

async function logout(formData: FormData) {
    "use server";
    POST.response(formData);
}

export default async function AdminDashboard() {
    return <>
        <h1>Admin Dashboard</h1>
        <form action={logout}>
            <button type='submit' className="btn-outline-primary bg-white">Logout</button>
        </form>
    </>;
}