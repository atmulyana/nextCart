/** 
 * https://github.com/atmulyana/nextCart
 **/
import React from 'react';
import lang from '@/data/lang';
import config from '@/config';
const html = config.footer.html as string;

export default function Footer(): React.ReactElement {
    return <div id="footer" className='fixed bottom-0 w-full h-[100px] bg-neutral-100 dark:bg-neutral-900 z-50'>
        <div className="flex h-full">
            <div className="relative w-full px-[15px] flex-grow-0 flex-shrink-0 basis-full self-center"
                dangerouslySetInnerHTML={{__html: html || `<h4 class="text-center">${lang('Powered by')} nextCart</h4>`}}
            >
            </div>
        </div>
    </div>;
}