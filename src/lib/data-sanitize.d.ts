/** 
 * https://github.com/atmulyana/nextCart
 **/
declare global {
    type SanitizedString<T extends string = string> = T | {$literal: T};
    
    interface FormData {
        getBoolean(paramName: string): boolean;
        getDate(paramName: string): Date | null;
        getFile(paramName: string): File | null;
        getNumber(paramName: string): number;
        getString(paramName: string, trimmed?: boolean): string;
        sanitize(paramName: string): SanitizedString | null;
    }
}

export declare function mergeData(data: {[name: string]: any}, formData: FormData | Array<[any, any]>): FormData;

declare function sanitize<T extends string>(value: T): SanitizedString<T>;
export default sanitize;