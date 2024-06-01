/** 
 * https://github.com/atmulyana/nextCart
 **/
import React from 'react';
import Loading from "@/components/Loading";

export default function() {
    return <div className='relative h-32 w-full'>
        <Loading isLoading={true} noBackdrop />
    </div>;
} 