/** 
 * https://github.com/atmulyana/nextCart
 **/
import React from 'react';
import config from '@/config';
import lang from '@/data/lang';

export default function ForgottenPasswordEmail({token}: {token: string}) {
    return <div className="wrapper">
        <div className="container">
            <div className="panel panel-default">
                <div className="panel-heading">
                    {/*eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text*/}
                    <img id="logo" src={`${config.baseUrl}/images/logo.svg`} />
                    <h1>{config.cartTitle}</h1>
                </div>
                <div className="panel-body">
                    <p>{lang('You are receiving this because you (or someone else) have requested the reset of the password for your user account')}.</p>
                    <p>{lang('Please click on the following link, or paste this into your browser to complete the process')}:</p>
                    <a href={`${config.baseUrl}/customer/reset/${token}`}>{`${config.baseUrl}/customer/reset/${token}`}</a>
                    <p>{lang('If you did not request this, please ignore this email and your password will remain unchanged')}.</p>
                </div>
            </div>
        </div>
    </div>;
}