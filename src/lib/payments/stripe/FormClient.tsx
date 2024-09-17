'use client';
/** 
 * https://github.com/atmulyana/nextCart
 **/
import React from 'react';
import {loadStripe, type Stripe, type StripeCardElement, type StripeCardElementOptions} from "@stripe/stripe-js";
import Form, {FormLoading} from '@/subview/components/Form';
import {useNotification} from '@/subview/components/Notification';
//import {inter} from '@/lib/font';
import darkMode from '@/lib/darkMode';
import './form.css';

const loadedStripes = new Map<string, Stripe | null>();

export default function StripeFormClient({
    action,
    description,
    failedMessage,
    publicKey,
    buttonText
}: {
    action: (formData: FormData) => Promise<any>,
    description: string,
    failedMessage: string,
    publicKey: string,
    buttonText: string
}) {
    const cardRef = React.useRef<HTMLDivElement>(null);
    const notify = useNotification();
    const [stripe, setStripe] = React.useState<Stripe | null>(null);
    const [card, setCard] = React.useState<StripeCardElement | null>(null);

    React.useEffect(() => {
        setCard(null);
        let strp = loadedStripes.get(publicKey);
        if (strp) setStripe(strp);
        else loadStripe(publicKey).then(strp => setStripe(strp));
    }, [publicKey]);

    React.useEffect(() => {
        if (!stripe || !cardRef.current) return;
        const elm = stripe.elements();
        const root = document.querySelector(':root') as HTMLElement;
        const rootStyle = window.getComputedStyle(root)
        const options: StripeCardElementOptions = {
            hidePostalCode: true,
            style: {
                base: {
                    color: rootStyle.getPropertyValue('--input-text-color'),
                    //fontFamily: inter.style.fontFamily, /*** NO EFFECT: different `document` (card input is inside `IFRAME`) */
                    fontSmoothing: 'antialiased',
                    fontSize: rootStyle.getPropertyValue('--font-size'),
                    lineHeight: rootStyle.getPropertyValue('--line-height'),
                },
                invalid: {
                    color: rootStyle.getPropertyValue('--color-danger'),
                    iconColor: rootStyle.getPropertyValue('--color-danger'),
                },
            },
        };
        const card = elm.create('card', options);
        card.mount(cardRef.current as HTMLElement);
        setCard(card);

        const updateCardOption = () => {
            card.update({
                style: {
                    base: {
                        color: rootStyle.getPropertyValue('--input-text-color'),
                        fontSize: rootStyle.getPropertyValue('--font-size'),
                        lineHeight: rootStyle.getPropertyValue('--line-height'),
                    },
                    invalid: {
                        color: rootStyle.getPropertyValue('--color-danger'),
                        iconColor: rootStyle.getPropertyValue('--color-danger'),
                    },
                },
            });
        };
        darkMode.addChangeListener(updateCardOption);
        return () => darkMode.removeChangeListener(updateCardOption);
    }, [stripe, cardRef.current]);

    React.useEffect(() => {
        if (card == null) return;
        const iframe = document.querySelector(".StripeElement")?.querySelector('iframe') as HTMLIFrameElement;
        const inputDoc = iframe.contentDocument;
        const styleElm = document.createElement("style");
        styleElm.setAttribute("type", "text/css");
        styleElm.textContent = `
        body {
            font-size: 16px;
        }
        .ElementsApp input {
            font-size: 1rem;
            height: 1.5rem;
            line-height: 1.5rem;
        }`;
        inputDoc?.head.appendChild(styleElm);
    }, [card]);
    
    return <Form action={action} loading={<FormLoading isLoading={!card} />} className='block'>
        <div className='mb-2'>{description}</div>
        <div ref={cardRef}></div>
        <input type='hidden' name='token' />
        <button
            className='btn-outline-success'
            type='button'
            onClick={e => {
                const form = (e.target as HTMLButtonElement).form;
                if (!stripe || !card || !form) return;
                stripe.createToken(card).then(resp => {
                    if (resp.error) {
                        notify(failedMessage, 'danger')
                    }
                    else {
                        (form.elements.namedItem('token') as HTMLInputElement).value = resp.token.id;
                        form.requestSubmit();
                    }
                });
            }}
        >{buttonText}</button>
    </Form>;
}