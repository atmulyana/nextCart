/** 
 * https://github.com/atmulyana/nextCart
 * 
 * We think it's a bug because 'template.tsx' doesn't work as expected (as described in docs 
 * - https://nextjs.org/docs/app/building-your-application/routing/pages-and-layouts#templates -
 * which says "templates create a new instance for each of their children on navigation"). We
 * found that the template is not re-rendered on every navigation. So, it's better that the
 * `Template` component below is inserted in every 'page.tsx'.
 **/
import lang from '@/data/lang';
import {refreshSessionExpires} from "@/data/session";
import UrlFixer from '@/components/UrlFixer';
import {SessionUpdater} from '@/components/SessionContext';
import {getRequestUrl, getSessionMessage, redirectWithMessage} from '@/lib/auth';

export default async function Template({children}: {children: React.ReactNode}) {
    const reqUrl = await getRequestUrl();
    const {isTokenDirty, isUserLogout, token: session} = await refreshSessionExpires();
    if (isUserLogout && reqUrl.path.startsWith('/admin') && reqUrl.path != '/admin/login') {
        await redirectWithMessage(
            '/admin/logout',
            {
                message: 'User was deleted',
                type: 'danger',
                counter: 2,
            },
            true
        );
    }
    if (session) {
        const msg = await getSessionMessage();
        if (msg.message) session.message = lang(msg.message);
        session.messageType = msg.type;
    }
    return <SessionUpdater value={session} isDirty={isTokenDirty}>
        {children}
        <UrlFixer {...reqUrl} />
    </SessionUpdater>;
}