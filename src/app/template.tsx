/** 
 * https://github.com/atmulyana/nextCart
 **/
import {getSession, refreshSession} from "@/data/session";
import {SessionUpdater} from '@/components/SessionContext';

export default async function RootTemplate({children}: { children: React.ReactNode }) {
    await refreshSession();
    const {_id, lastAccess, cart, customerId, userId, blockonomicsParams, customerPresent, userPresent, ...session} = await getSession();
    return <> 
        {children}
        <SessionUpdater value={{
            ...session,
            customerPresent,
            userPresent,    
        }} />
    </>;
}