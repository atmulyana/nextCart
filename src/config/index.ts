/** 
 * https://github.com/atmulyana/nextCart
 **/
import 'server-only';
import cfg from './config';
import clientUsable, {type UsableOnClientConfig} from './usable-on-client';
import emailCfg from './email';
import sessionCfg from './session';

export type Config = typeof cfg &
    {email: typeof emailCfg} &
    UsableOnClientConfig &
    {session: typeof sessionCfg};

const config: Config = {
    ...cfg,
    email: emailCfg,
    ...clientUsable,
    session: sessionCfg,
};
export default config;
