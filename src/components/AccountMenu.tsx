'use client';
/** 
 * https://github.com/atmulyana/nextCart
 **/
import React from 'react';
import {useFormState} from "react-dom";
import Link from 'next/link';
import {usePathname, useRouter, useSearchParams} from 'next/navigation';
import {useSession} from './SessionContext';
import {useCart} from './Cart';
import DropDown from './DropDown';
import Icon from './Icon';
import {logoutCustomer} from '@/app/actions';

type AccountMenuProps = {
    accountLabel?: string,
    logoutLabel?: string,
}

const AccountMenu = React.memo(function AccountMenu({
    accountLabel = 'Account',
    logoutLabel = 'Logout',
}: AccountMenuProps) {
    const session = useSession();
    const router = useRouter();
    const form = React.useRef<HTMLFormElement>(null);
    const pathname = usePathname();
    const searchParams = useSearchParams().toString();
    
    return <>
        <CartUpdater />
        {session.customerPresent ? (<>
            <DropDown
                label={<Icon name='user' />}
                items={[
                    {
                        label: accountLabel,
                        onClick: () => router.push('/customer/account'),
                    },
                    {
                        label: logoutLabel,
                        onClick: () => {
                            form.current?.requestSubmit();
                        },
                    }
                ]}
            />
            <form
                ref={form}
                action={logoutCustomer}
                //action='/customer/logout' method='post'
                className='hidden'
            >
                <input type='hidden' name='referrerUrl' value={`${pathname}${searchParams ? '?' + searchParams : ''}`} />
            </form>
        </>) : (
            <Link href="/customer/account" className="btn leading-none"><Icon name="user" /></Link>
        )}
    </>;
});
export default AccountMenu;

const CartUpdater = React.memo(function CartUpdater() {
    const session = useSession()
    const cart = useCart();
    const lastState = React.useRef(session.customerPresent);
        
    React.useEffect(() => {
        const isLoggedOut = lastState.current && !session.customerPresent;
        lastState.current = session.customerPresent;
        if (isLoggedOut) cart.update(null);
    }, [session.customerPresent]);

    return null;
});