/** 
 * https://github.com/atmulyana/nextCart
 **/
import React from 'react';
//import {renderToStaticMarkup} from 'react-dom/server';
import {render} from '@react-email/render';
import * as nodemailer from 'nodemailer';
import type SMTPTransport from 'nodemailer/lib/smtp-connection';
import config from '@/config';

export async function sendEmail(to: string, subject: string, body: React.ReactElement | string) {
    const emailSettings:SMTPTransport.Options = {
        host: config.email.host,
        port: config.email.port,
        secure: config.email.secure,
        auth: {
            user: config.email.user,
            pass: config.email.password,
        }
    };
    if(config.email.host == 'smtp-mail.outlook.com'){
        emailSettings.tls = { 
            ciphers: 'SSLv3',
        };
    }
    const transporter = nodemailer.createTransport(emailSettings);

    const mailOptions: nodemailer.SendMailOptions = {
        from: config.email.fromAddress,
        to: to,
        subject: subject,
    };
    if (typeof(body) == 'string') {
        mailOptions.text = body;
    }
    else {
        let bodyHtml = await render(body, {pretty: true}); //renderToStaticMarkup(body)
        bodyHtml = bodyHtml.substring(bodyHtml.indexOf('<div')); //removes `<!DOCTYPE ... >`
        mailOptions.html = `<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="utf-8" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>
            body {
                font-family: "Helvetica Neue",Helvetica,Arial,sans-serif;
                font-size: 14px;
                line-height: 1.42857143;
                color: #333;
                background-color: #fff;
            }
            body {
                margin: 0;
            }
            .panel-default>.panel-heading {
                color: #333;
                background-color: #f5f5f5;
                border-color: #ddd;
            }
            .panel-heading {
                padding: 10px 15px;
                border-bottom: 1px solid transparent;
                border-top-left-radius: 3px;
                border-top-right-radius: 3px;
            }
            .panel-default {
                border-color: #ddd;
            }
            * {
                -webkit-box-sizing: border-box;
                -moz-box-sizing: border-box;
                box-sizing: border-box;
            }
            .panel {
                margin-bottom: 20px;
                background-color: #fff;
                border: 1px solid #ddd;
                border-radius: 4px;
                -webkit-box-shadow: 0 1px 1px rgba(0,0,0,.05);
                box-shadow: 0 1px 1px rgba(0,0,0,.05);
            }
            .panel-body {
                padding: 15px;
                min-height: 400px;
            }
            .text-danger {color: #e74c3c;}
            .text-success {color: #18bc9c;}
            .h1, h1 {font-size: 36px;}
            .h2, h2 {font-size: 30px;}
            .h3, h3 {font-size: 24px;}
            .h4, h4 {font-size: 18px;}
            .wrapper{width: 100%;}

            @media (max-width: 768px) { 
                .container{position: absolute; width: 100%; padding: 15px; text-align: center;}
                .h1, h1 {font-size: 46px;}
                .h2, h2 {font-size: 40px;}
                .h3, h3 {font-size: 34px;}
                .h4, h4 {font-size: 24px;}
            }
            @media (min-width: 768px) { 
                .container{position: absolute; left: 10%; width: 80%; padding: 15px; text-align: center;}
                .h1, h1 {font-size: 46px;}
                .h2, h2 {font-size: 40px;}
                .h3, h3 {font-size: 34px;}
                .h4, h4 {font-size: 24px;}
            }
            @media (min-width: 992px) {  
                .container{position: absolute;left: 20%; width: 60%; text-align: center;}
                .h1, h1 {font-size: 46px;}
                .h2, h2 {font-size: 40px;}
                .h3, h3 {font-size: 34px;}
                .h4, h4 {font-size: 24px;}
            }
            @media (min-width: 1200px) { 
                .container{position: absolute;left: 25%; width: 50%; text-align: center;}
            }
        </style>
    </head>
    <body>
        ${bodyHtml}
    </body>
</html>`;
    }
    await transporter.sendMail(mailOptions);
}