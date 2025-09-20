/** 
 * https://github.com/atmulyana/nextCart
 **/
declare class BaseURL extends URL {
    //constructor(input: URL | string, base?: URL | string);
    readonly path: string;
    toJSON(): string;
}
export default BaseURL;