/** 
 * https://github.com/atmulyana/nextCart
 **/
export default require('./config.json') as {
    cartDescription: string,
    cartLogo: string,
    footer: {
        html: string | null,
        shownForCustomer: boolean,
        shownForAdmin: boolean,
    },
    googleAnalytics: string,
    databaseConnectionString: string,
    enableLanguages: boolean,
    availableLanguages: {[locale: string]: string},
    defaultLocale: string,
    twitterHandle: string,
    facebookAppId: string,
    productOrderBy: string,
    productOrder:  'ascending' | 'descending',
};