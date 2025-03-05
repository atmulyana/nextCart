'use client';
/** 
 * https://github.com/atmulyana/nextCart
 **/
import * as React from 'react';
import Link from 'next/link';
import cfg from '@/config/usable-on-client';
import {getErrorPageTexts} from './actions';

export default function Error({
    error,
    reset,
}: {
    error: Error,
    reset: () => void,
}) {
    const [texts, setTexts] = React.useState(["Server can't process your request", "Reload"]);

    React.useEffect(() => {
        getErrorPageTexts().then(texts => setTexts(texts));
    //eslint-disable-next-line react-hooks/exhaustive-deps
    }, texts);
    React.useEffect(() => {
        console.log(error)
    }, [error]);

    return  <>
        <nav id="headerBar" className="flex items-center py-2 px-4 leading-normal">
            {/*eslint-disable-next-line @next/next/no-img-element*/}
            <Link href="/"><img src={`${cfg.baseUrl.path}/images/logo.svg`} alt='logo' style={{height: '80px'}} /></Link>
        </nav>
        <div id="container" className="text-center h-full py-8">
            <h3 className='text-center w-full'>{texts[0]}</h3>
            <button className='btn-primary' onClick={() => reset()}>{texts[1]}</button>
        </div>
    </>;
}