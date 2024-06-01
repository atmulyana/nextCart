'use client';
/** 
 * https://github.com/atmulyana/nextCart
 **/
import React from 'react';
import {useSession} from 'next-auth/react';
import {usePathname, useSearchParams} from 'next/navigation'

function Updater() {
    const [refreshed, setRefreshed] = React.useState(false);
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const {update, status} = useSession();
    
    React.useEffect(() => {
        setRefreshed(false);
    }, [pathname, searchParams]);

    React.useEffect(() => {
        if (status == 'authenticated' && !refreshed) {
            update({refresh: 'EXPIRES'}).then(session => {
                setRefreshed(true);
            });
        }
    }, [status, refreshed]);

    return null;
}

export default function SessionUpdater() {
    return <React.Suspense fallback={null}>
        <Updater />
    </React.Suspense>;
}