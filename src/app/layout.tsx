/** 
 * https://github.com/atmulyana/nextCart
 **/
import './globals.css'
import type {Metadata, Viewport} from 'next'
import {Inter} from 'next/font/google'
const inter = Inter({ subsets: ['latin'] })
import Script from 'next/script'
import config from '@/config'
import lang from '@/data/lang'
import {ModalContext} from '@/components/Modal'
import {NotificationContext} from '@/components/Notification'
import {SessionProvider} from '@/components/SessionContext'
import {initActions} from './actions'

const title = 'Shop'
export const metadata: Metadata = {
    title,
    description: config.cartDescription,
    keywords: config.cartTitle,
    referrer: 'origin',
    metadataBase: new URL(config.baseUrl),
    alternates: {
        canonical: config.baseUrl,
    },
    openGraph: {
        siteName: config.cartTitle,
        type: 'website',
        title,
        url: config.baseUrl,
        description: config.cartDescription,
    },
    twitter: {
        card: 'summary',
        title,
        site: config.baseUrl,
    },
}
export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
}
if (config.twitterHandle && metadata.twitter) metadata.twitter.site = config.twitterHandle

export default async function RootLayout({
        children
    }: {
        children: React.ReactNode
}) {
    await initActions()
    return (
        <html lang="en" className={inter.className}>
            <head>
                <meta httpEquiv="X-UA-Compatible" content="IE=edge"></meta>
                <Script src="/scripts/darkMode.js" />
                {config.facebookAppId && <meta property="fb:app_id" content={config.facebookAppId} />}
            </head>
            <body>
            <NotificationContext>
            <ModalContext
                title={lang('Confirm')}
                content={lang('Are you sure you want to proceed?')}
                okLabel={lang('Confirm')}
                cancelLabel={lang('Close')}
            >
            <SessionProvider>
                {children}
            </SessionProvider>
            </ModalContext>
            </NotificationContext>
            </body>
        </html>
    )
}
