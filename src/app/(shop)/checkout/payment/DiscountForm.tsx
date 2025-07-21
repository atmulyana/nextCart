'use client';
/** 
 * https://github.com/atmulyana/nextCart
 **/
import React from 'react';
import {required} from '@react-input-validator/rules';
import {ValidatedInput} from '@react-input-validator/web';
import Button from '@/subview/components/SubmitButton';
import {CartForm, useCart} from '@/subview/components/Cart';
import FormWithSchema from '@/subview/components/FormWithSchema';
import Icon from '@/subview/components/Icon';
import {useSchemaProps} from '@/subview/components/SchemaContext';
import Input from '@/subview/components/SubmittedInput';
import {changeDiscount} from '@/app/actions';

type Props = {applyTitle: string, discountTitle: string};

export default function DiscountForm(props: Props) {
    const getProps = useSchemaProps();
    const cart = useCart();
    
    return <FormWithSchema
        action={changeDiscount}
        className='block mb-4'
        Form={CartForm}
        loading={true}
        schemaName='discountCode'
    >
        <ValidatedInput
            {...getProps('discountCode')}
            {...props}
            Component={DiscountInput}
            value={typeof(cart?.discount) == 'string' ? cart.discount : cart?.discount?.code}
        />
    </FormWithSchema>;
}

const DiscountInput = React.forwardRef(function DiscountInput(
    {applyTitle, className, discountTitle, ...props}: React.ComponentProps<typeof Input<'text', true>> & Props,
    ref: React.Ref<HTMLInputElement>
) {
    return <div className='flex flex-wrap'>
        <Input
            {...props}
            ref={ref}
            placeholder={discountTitle}
            noValidation
            className={`relative z-0 flex-1 min-w-0 rounded-r-none ${className}`}
        />
        <Button name='change' type="submit" className="relative flex-none z-[1] rounded-none btn-outline-success -ml-px">
            {applyTitle}
        </Button>
        <Button name='remove' type="submit" value='x' className="relative flex-none z-[1] rounded-l-none btn-outline-danger -ml-px">
            <Icon name="x" />
        </Button>
    </div>;
});