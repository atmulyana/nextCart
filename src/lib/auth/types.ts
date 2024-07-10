/** 
 * https://github.com/atmulyana/nextCart
 **/
import type {NotificationParam}  from '@/components/Notification';

declare module "next-auth" {
    interface User {
        id?: string;
        email?: string | null;
        isCustomer: boolean;
        isAdmin?: boolean;
        isOwner?: boolean;
        token?: JWT | null;
    }
    
    interface Session extends JWT {
        customerPresent: boolean,
        user?: JWT['user'],
    }
}

import {JWT} from "next-auth/jwt";

declare module "next-auth/jwt" {
    interface JWT {
        id: string;
        user?: {
            id: string;
            isAdmin: boolean;
            isOwner: boolean;
        } | null;
        customer?: {
            id?: string;
            email?: string | null;
            chartItemCount: number;
        } | null;
        message?: string;
        messageType?: NotificationParam['type'];
        //refresh?: 'EXPIRES';
    }
}