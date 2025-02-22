/** 
 * https://github.com/atmulyana/nextCart
 **/
import React from 'react';
import Loading from "@/subview/components/Loading";

export default function ContentLoading() {
    return <div className='relative h-32 w-full'>
        <Loading isLoading={true} noBackdrop />
    </div>;
} 