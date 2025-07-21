/** 
 * https://github.com/atmulyana/nextCart
 **/
declare global {
    interface Window {
        __currenLocale__: string;
    }
}
declare const currentLocale: () => string;
export default currentLocale;