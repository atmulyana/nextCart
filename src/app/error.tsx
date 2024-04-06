'use client';
/** 
 * https://github.com/atmulyana/nextCart
 **/
import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {getErrorPageTexts} from './actions';

export default function Error({
  reset,
}: {
  reset: () => void
}) {
    const [texts, setTexts] = React.useState(["Server can't process your request", "Reload", false, false]);

    React.useEffect(() => {
        getErrorPageTexts().then(texts => setTexts(texts));
    }, texts);

    return  <>
        <nav id="headerBar" className="flex items-center py-2 px-4 leading-normal">
            <Link href="/"><Image src='/images/logo.png' alt='logo' width={317} height={82} /></Link>
        </nav>
        <div id="container" className="text-center h-full py-8">
            <h3 className='text-center w-full'>{texts[0]}</h3>
            <button className='btn-primary' onClick={() => reset()}>{texts[1]}</button>
        </div>
    </>;
}