/** 
 * https://github.com/atmulyana/nextCart
 **/
type JSON = any;

declare const projectRoot: () => string | null;
declare const readFileText: (path: string, relativeToServer?: boolean) => string;
declare const readJSON: <T extends JSON = JSON>(path: string, relativeToServer?: boolean) => JSON;
declare const saveFileText: (path, text) => any;
declare const saveJSON: (path: string, obj: any) => any;
declare const serverRoot: () => string | null;
export {projectRoot, readFileText, readJSON, saveFileText, saveJSON, serverRoot};
