/** 
 * https://github.com/atmulyana/nextCart
 **/
import fs from 'fs';
import {emptyString} from 'javascript-common';
import {serverRoot} from '@/lib/file-util';

export async function GET() {
    let css = emptyString;
    try {
        css = fs.readFileSync(serverRoot() + '/config/custom.less', 'utf8');
    }
    catch {}
    
    const response = new Response(
        css,
        {
            headers: {
                'Content-Type': 'text/css'
            }
        }
    );

    return response;
}