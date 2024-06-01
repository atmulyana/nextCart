/** 
 * https://github.com/atmulyana/nextCart
 **/
import 'server-only';
import clientUsable, {type UsableOnClientConfig} from './usable-on-client';

export type SessionConfig = {
    paramName: string,
    maxAge: number | null,
};

export type Config = {
    cartDescription: string,
    cartLogo: string,
    productOrderBy: "date" | "title",
    productOrder: "ascending" | "descending",
    footer: {
        html: string | null,
        shownForCustomer: boolean,
        shownForAdmin: boolean,
    },
    databaseConnectionString: string,
    enableLanguages: boolean,
    availableLanguages: Record<string, string>,
    defaultLocale: string,
    twitterHandle: string,
    facebookAppId: string,
    session: SessionConfig,
} & UsableOnClientConfig;

const config: Config = {
    ...require('./settings.json'),
    ...clientUsable
};
export default config;
