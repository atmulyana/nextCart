/** 
 * https://github.com/atmulyana/nextCart
 **/
const {readJSON} = require('@/lib/file-util');
import './session.json';
try {
    require('./session-local.json');
}
catch {}

export type SessionConfig = {
    paramName: string,
    maxAge: number | null,
    secret: string,
};

let cfg!: SessionConfig;
if (!cfg) {
    if (process.env.NEXT_RUNTIME === 'edge') {
        cfg = {
            paramName: (process.env.AUTH_COOKIE_NAME as string).trim(),
            maxAge: parseInt(process.env.AUTH_COOKIE_EXPIRES?.trim() as any) || null,
            secret: process.env.AUTH_SECRET as string,
        }
    }
    else {
        cfg = readJSON('/config/session.json');
        let lcfg: Partial<SessionConfig> = {}
        try {
            lcfg = readJSON('/config/session-local.json');
        }
        catch {}
        cfg = {...cfg, ...lcfg};
    }
}

export default cfg;