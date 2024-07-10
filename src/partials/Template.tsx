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
import {auth} from '@/lib/auth';
import {SessionUpdater} from '@/components/SessionContext';

export default async function Template({children}: {children: React.ReactNode}) {
    const session = await auth();
    if (session) {
        await refreshSessionExpires(new Date(session.expires), session.id);
        if (session.message) session.message = lang(session.message);
    }
    return <> 
        {children}
        <SessionUpdater value={session} />
    </>;
}