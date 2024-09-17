/** 
 * https://github.com/atmulyana/nextCart
 * 
 * We think it's a bug because 'template.tsx' doesn't work as expected (as described in docs 
 * - https://nextjs.org/docs/app/building-your-application/routing/pages-and-layouts#templates -
 * which says "templates create a new instance for each of their children on navigation"). We
 * found that the template is not re-rendered on every navigation. So, it's better that the
 * `Template` component below is inserted in every 'page.tsx'.
 **/
import {cookies} from 'next/headers';
import lang from '@/data/lang';
import {refreshSessionExpires} from "@/data/session";
import UrlFixer from '@/subview/components/UrlFixer';
import {SessionUpdater} from '@/subview/components/SessionContext';
import {getRequestUrl, getSessionMessage, getSessionToken} from '@/lib/auth';

export default async function Template({children}: {children: React.ReactNode}) {
    const session = await getSessionToken();
    if (session) {
        await refreshSessionExpires(new Date(session.expires), session.id);
        const msg = await getSessionMessage();
        if (msg.message) session.message = lang(msg.message);
        session.messageType = msg.type;
    }
    return <> 
        {children}
        <SessionUpdater value={session} />
        <UrlFixer {...getRequestUrl()} />
    </>;
}