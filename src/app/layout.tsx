/** 
 * https://github.com/atmulyana/nextCart
 **/
import '@/lib/darkMode'
import './globals.css'
import type {Metadata, Viewport} from 'next'
import config from '@/config'
import lang from '@/data/lang'
import currentLocale from '@/lib/currentLocale/server'
import Html from '@/components/Html'
import {CartContext} from '@/components/Cart'
import {ModalContext} from '@/components/Modal'
import {NotificationContext} from '@/components/Notification'
import {SessionProvider} from '@/components/SessionContext'
import {initActions} from './actions'
import {getCart} from '@/data/cart'
import type {TCart} from '@/data/types'

import messages1 from '@react-input-validator/rules/messages'
import messages2 from '@react-input-validator/rules-datetime/messages'
import messages3 from '@react-input-validator/rules-file/messages'
import messages4 from '@/lib/schemas/messages'

type Messages = {[s: string]: string | Messages}
function getTexts(messages: Messages, translates: React.ComponentProps<typeof Html>['lang'] = {}) {
    for (let key in messages) {
        const msg = messages[key]
        if (typeof(msg) == 'object') translates = getTexts(msg, translates)
        else translates[msg] = lang(msg)
    }
    return translates
}

const title = 'Shop'
export const metadata: Metadata = {
    title,
    description: config.cartDescription,
    keywords: config.cartTitle,
    referrer: 'origin',
    metadataBase: config.baseUrl,
    alternates: {
        canonical: config.baseUrl,
    },
}
export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
}

export default async function RootLayout({
        children
    }: {
        children: React.ReactNode
}) {
    await initActions()
    const locale = currentLocale()
    let texts = getTexts(messages1)
    texts = getTexts(messages2, texts)
    texts = getTexts(messages3, texts)
    texts = getTexts(messages4, texts)
    
    let _id: any, cart: TCart | undefined
    const cartWithId = await getCart()
    //eslint-disable-next-line @typescript-eslint/no-unused-vars
    if (cartWithId) ({_id, ...cart} = cartWithId)
    
    return <Html lang={texts} locale={locale}>
        <head>
            <meta httpEquiv="X-UA-Compatible" content="IE=edge"></meta>
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
        <CartContext cart={cart}>
            {children}
        </CartContext>
        </SessionProvider>
        </ModalContext>
        </NotificationContext>
        </body>
    </Html>
}
