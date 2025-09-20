/** 
 * https://github.com/atmulyana/nextCart
 **/
import type {UsableOnClientConfig} from "@/config/usable-on-client";
import type {SessionConfig} from "@/config/session";

declare const setEnvVarsFromConfig: () => void;
declare const setEnvVars: (clientCfg: UsableOnClientConfig, sessionCfg: SessionConfig) => void;
export {setEnvVars, setEnvVarsFromConfig};