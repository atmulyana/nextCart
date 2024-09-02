'use client';
/** 
 * https://github.com/atmulyana/nextCart
 **/
import React from 'react';
import Button from '@/components/SubmitButton';
import {CartForm, useCart} from '@/components/Cart';
import Icon from '@/components/Icon';
import Input from '@/components/SubmittedInput';
import {changeDiscount} from '@/app/actions';

export default function DiscountForm({applyTitle, discountTitle}: {applyTitle: string, discountTitle: string}) {
    const cart = useCart();
    return <CartForm
        action={changeDiscount}
        loading={true}
        className='relative flex flex-wrap items-stretch w-full mb-4'
    >
        <Input name="discountCode" required
            value={typeof(cart?.discount) == 'string' ? cart.discount : cart?.discount?.code}
            placeholder={discountTitle}
            className="relative z-0 flex-1 min-w-0 rounded-r-none"
        />
        <Button name='change' type="submit" className="relative flex-none z-[1] rounded-none btn-outline-success -ml-px">
            {applyTitle}
        </Button>
        <Button name='remove' type="submit" className="relative flex-none z-[1] rounded-l-none btn-outline-danger -ml-px">
            <Icon name="x" />
        </Button>
    </CartForm>;
}