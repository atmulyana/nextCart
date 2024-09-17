'use client';
/** 
 * https://github.com/atmulyana/nextCart
 **/
import React from 'react';
import Link from 'next/link';
import {usePathname, useRouter, useSearchParams} from 'next/navigation';
import {useSession} from '@/subview/components/SessionContext';
import DropDown from '@/subview/components/DropDown';
import Icon from '@/subview/components/Icon';
import {logoutCustomer} from '@/app/actions';

type AccountMenuProps = {
    accountLabel?: string,
    logoutLabel?: string,
}

const MemoizedAccountMenu = React.memo(function MemoizedAccountMenu({
    accountLabel = 'Account',
    logoutLabel = 'Logout',
}: AccountMenuProps) {
    const session = useSession();
    const router = useRouter();
    const form = React.useRef<HTMLFormElement>(null);
    const pathname = usePathname();
    const searchParams = useSearchParams().toString();
    
    return <>
        {session?.customerPresent ? (<>
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

export default function AccountMenu(props: AccountMenuProps) {
    return <React.Suspense fallback={null}>
        <MemoizedAccountMenu {...props} />
    </React.Suspense>;
}