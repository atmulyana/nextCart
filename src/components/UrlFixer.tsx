'use client';
/** 
 * https://github.com/atmulyana/nextCart
 **/
import React from 'react';
import {useRouter} from 'next/navigation';

/**
 * NextJs BUG: If we use `redirect` function in a server action but then, because of a condition,
 * it is redirected again by `NextResponse.redirect` in middleware then the displayed page will be
 * the one pointed by `NextResponse.redirect` but `location.pathname` and `usePathname()` will
 * refer the URL pointed by `redirect`. This component will overcome this mess.
 */
export default function UrlFixer({path, search}: {path: string, search: string}) {
    const router = useRouter();
    React.useEffect(() => {
        if (path != location.pathname || search != location.search) {
            router.replace(path + search);
        }
    }, [path, search]);
    return null;
}
