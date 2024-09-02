/** 
 * https://github.com/atmulyana/nextCart
 **/
export default {
    cartDescription: "nextCart",
    cartLogo: "",
    
    footer: {
        html: null as string | null,
        shownForCustomer: true,
        shownForAdmin: false,
    },
    googleAnalytics: "",
    databaseConnectionString: "mongodb://127.0.0.1:27017/nextcart?replicaSet=rs0",
    enableLanguages: true,
    availableLanguages: {
        en: "English",
        id: "Indonesia",
        it: "Italiano"
    } as {[locale: string]: string},
    defaultLocale: "en",
    twitterHandle: "",
    facebookAppId: "",
    productOrderBy: "date",
    productOrder: "descending" as 'ascending' | 'descending',
};