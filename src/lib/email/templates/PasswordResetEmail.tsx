/** 
 * https://github.com/atmulyana/nextCart
 **/
import React from 'react';
import config from '@/config';
import lang from '@/data/lang';
import {str} from '@/lib/common';

export default function ForgottenPasswordEmail({email}: {email: string}) {
    return <div className="wrapper">
        <div className="container">
            <div className="panel panel-default">
                <div className="panel-heading">
                    {/*eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text*/}
                    <img id="logo" src={`${config.baseUrl}/images/logo.svg`} />
                    <h1>{config.cartTitle}</h1>
                </div>
                <div className="panel-body">
                    <p>{str(
                        lang('This is a confirmation that the password for your account ${email} has just been changed successfully'),
                        {email}
                    )}.</p>
                </div>
            </div>
        </div>
    </div>;
}