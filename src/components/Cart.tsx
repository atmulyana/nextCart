'use client';
/** 
 * https://github.com/atmulyana/nextCart
 **/
import type {TCart, TCartItem} from '@/data/types';
import React from 'react';
import Link from 'next/link';
import {usePathname, useRouter} from 'next/navigation';
import {currencySymbol, formatAmount} from '@/lib/common';
import {clearCart, updateCartItem} from '@/app/actions';
import FlexImage from './FlexImage';
import Form from './Form';
import Icon from './Icon';
import {useModal} from './Modal';
import SubmitButton from './SubmitButton';
import SubmittedInput from './SubmittedInput';

interface ContextValue extends TCart {
    update(cart: TCart | null | undefined, callback?: (cart: TCart) => any): void;
}

const defaultCart: TCart = {
    items: {},
    totalCartNetAmount: 0,
    totalCartDiscount: 0,
    totalCartShipping: 0,
    totalCartAmount: 0,
    totalCartItems: 0,
    totalCartProducts: 0,
}

const Context = React.createContext<ContextValue>({
    ...defaultCart,
    update: () => {},
});

export function CartContext({cart, children}: {cart?: TCart, children: React.ReactNode}) {
    const updateCallback = React.useRef<(cart: TCart) => any>();
    const [value, setValue] = React.useState<ContextValue>({
       ...(cart ?? defaultCart),
       update: (cart: TCart | null | undefined, callback?: (cart: TCart) => any) => {
            if (callback) updateCallback.current = callback;    
            setValue(val => ({
                ...(cart ?? defaultCart),
                update: val.update,
            }));
        }
    });

    React.useEffect(() => {
        value.update(cart, updateCallback.current);
    }, [cart]);

    React.useEffect(() => {
        const callback = updateCallback.current;
        if (callback) {
            updateCallback.current = undefined;
            callback(value);
        }
    }, [value]);
    
    return <Context.Provider value={value}>
        {children}
    </Context.Provider>;
}

export function useCart() {
    return React.useContext(Context);
}

function closeCart() {
    document.body.classList.remove('pushy-open-right');
}

export function CartForm({
    children,
    loading = null,
    ...props
}: Parameters<typeof Form>[0]) {
    const cart = useCart();
    const router = useRouter();
    return <Form 
        {...props}
        loading={null}
        onSubmitted={({data}) => cart.update(data?.cart)}
    >
        {children}
    </Form>
}

export const CartOpenButton = React.memo(function CartOpenButton({cartText}: {cartText: string}) {
    const pathname = usePathname();
    const cart = useCart();
    if (pathname.toLowerCase().startsWith('/checkout')) return null;
    return <Link
        href="/checkout/cart"
        className="btn leading-none whitespace-nowrap"
        onClick={e => {
            e.preventDefault();
            document.body.classList.add('pushy-open-right');
            return false;
        }}
    >
        <Icon name='shopping-cart' />
        {` ${cartText} `}
        <span
            id="cart-count"
            className="relative -top-1.5 -left-1 rounded px-1 py-0.5 align-baseline
                text-xs font-bold
                text-[--bg-color] bg-[#dc3545] dark:bg-[#23caba]"
        >{cart.totalCartItems}</span>
    </Link>;
});

export const CloseCartButton = React.memo(function CloseCartButton() {
    return <button type="button" className='btn-primary' onClick={closeCart}><Icon name='x' /></button>
});

export const Cart = React.memo(function Cart({
    title,
    optionText,
    discountText,
    totalText,
    emptyText,
    qtyText,
    readonly = false,
    homeAfterClear = false,
}: {
    title: string,
    optionText: string,
    discountText: string,
    totalText: string,
    emptyText: string,
    qtyText: string,
    readonly?: boolean,
    homeAfterClear?: boolean,
}) {
    const cart = useCart(),
          itemIds = Object.keys(cart.items);
    let item: TCartItem;

    return <div className="flex-initial flex flex-col items-stretch min-h-0 bg-[--bg-color] bordered">
        <h5 className="flex-none mb-3">{title}</h5>
        <div className="flex-initial min-h-0 overflow-auto cartBodyWrapper">
            {itemIds.map(cartItemId => (item = cart.items[cartItemId],
            <div key={cartItemId} className="flex flex-row items-center pb-4 mx-4">
                <div className="flex-none basis-1/4 pl-0">
                    <FlexImage src={item.productImage} alt={item.title}/>
                </div>
                <div className="flex-none basis-3/4 flex flex-row flex-wrap pl-2">
                    <div className="flex-none basis-full mb-2">
                        <h6 className='mb-0'><Link href={`/product/${item.link}`} onClick={closeCart}>{item.title}</Link></h6>
                        {item.variantId && <><strong>{optionText}:</strong> {item.variantTitle}</>}
                    </div>
                    {readonly
                        ? <div className="flex-none basis-2/3">{qtyText}: {item.quantity}</div>
                        : <CartItemForm id={cartItemId} quantity={item.quantity} homeAfterClear={homeAfterClear} />
                    }
                    <strong className="flex-none basis-1/3 self-center text-right">
                        {currencySymbol()}{formatAmount(item.totalItemPrice)}
                    </strong>
                </div>
            </div>
            ))}
        </div>
        <div className="flex-none cartTotalsWrapper">
            {itemIds.length > 0 ? (
            <div>
                {cart.totalCartShipping > 0 ? (
                <div className="text-right">
                    {cart.shippingMessage}: <strong id="shipping-amount">{currencySymbol()}{formatAmount(cart.totalCartShipping)}</strong>
                </div>
                ) : (
                <div className="text-right">
                    <span id="shipping-amount">{cart.shippingMessage}</span>
                </div>
                )}

                {cart.totalCartDiscount > 0 &&
                <div className="text-right">
                    {discountText}: <strong id="discount-amount">{currencySymbol()}{formatAmount(cart.totalCartDiscount)}</strong>
                </div>}
                
                <div className="text-right">
                    {totalText}: <strong id="total-cart-amount">{currencySymbol()}{formatAmount(cart.totalCartAmount)}</strong>
                </div>
            </div>
            ) : (
            <div id="cart-empty">
                {emptyText}
            </div>
            )}
        </div>
    </div>;
});

function CartItemForm({id, quantity, homeAfterClear}: {id: string, quantity: number, homeAfterClear?: boolean}) {
    let sQuantity: string = '';
    const qtyRef = React.useRef<HTMLInputElement>(null);

    React.useEffect(() => {
        if (qtyRef.current) qtyRef.current.value = quantity.toString(); //always resets `quantity` when re-rendering
    });

    return <CartForm
        action={updateCartItem}
        className="flex-none basis-2/3 flex flex-row"
    >
        {homeAfterClear && <input type='hidden' name='homeAfterClear' value='1' />}
        <input type="hidden" name="cartId" value={id} />
        <div className="relative flex-none basis-3/4 flex items-stretch input-group pr-4">
            <SubmitButton
                name="__action__"
                value="decrease"
                className="btn-primary flex-none z-[1] -mr-px rounded-r-none"
            >-</SubmitButton>
            <SubmittedInput
                ref={qtyRef}
                type="number" 
                name="quantity"
                defaultValue={quantity}
                className="flex-1 text-center z-0 rounded-none" 
                maxLength={2} 
                onFocus={e => {
                    sQuantity = e.currentTarget.value;
                }}
                onBlur={e => {
                    if (sQuantity != e.currentTarget.value) e.currentTarget.form?.requestSubmit();
                }}
            />
            <SubmitButton
                name="__action__"
                value="increase"
                className="btn-primary flex-none z-[1] -ml-px rounded-l-none"
            >+</SubmitButton>
        </div>
        <div className="flex-none basis-1/4">
            <SubmitButton name="__action__" value="delete" className="btn-danger"><Icon name="trash-2" /></SubmitButton>
        </div>
    </CartForm>;
}

export const CartOverlay = React.memo(function CartOverlay() {
    return <div className='site-overlay' onClick={closeCart}></div>;
});

export const CartButtons = React.memo(function CartButtons({
    checkoutText,
    clearCartText,
    homeAfterClear = false,
}: {
    checkoutText: string,
    clearCartText: string,
    homeAfterClear?: boolean,
}) {
    const cart = useCart();
    const path = usePathname();
    const openConfirm = useModal();
    return <div className={`flex-none checkout-buttons ${Object.keys(cart.items).length > 0 ? '' : 'hidden'}`}>
        <CartForm action={clearCart} className='flex-none'>
            {homeAfterClear && <input type='hidden' name='homeAfterClear' value='1' />}
            <SubmitButton type="button" className='btn-danger'
                onClick={async e => {
                    if (await openConfirm()) {
                        (e.target as HTMLButtonElement).form?.requestSubmit();
                    }
                    else {
                        e.preventDefault();
                    }
                }}
            >{clearCartText}</SubmitButton>
        </CartForm>
        {path != '/checkout/information'
            && <Link href='/checkout/information' onClick={closeCart} className='btn btn-primary flex-none'>{checkoutText}</Link>}
    </div>;
});