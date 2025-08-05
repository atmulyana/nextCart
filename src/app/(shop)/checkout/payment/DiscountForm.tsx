'use client';
/** 
 * https://github.com/atmulyana/nextCart
 **/
import React from 'react';
import {emptyString} from 'javascript-common';
import {changeDiscount} from '@/app/actions';
import Button from '@/components/SubmitButton';
import {CartForm, useCart} from '@/components/Cart';
import FormWithSchema from '@/components/FormWithSchema';
import Icon from '@/components/Icon';
import ValidatedInput from '@/components/ValidatedInput';

type Props = {applyTitle: string, discountTitle: string};

export default function DiscountForm(props: Props) {
    const cart = useCart();
    const [code, setCode] = React.useState(emptyString);

    React.useEffect(() => {
        setCode(typeof(cart?.discount) == 'string' ? cart.discount : cart?.discount?.code ?? emptyString);
    }, [cart?.discount]);

    return <FormWithSchema
        action={changeDiscount}
        className='block mb-4'
        Form={CartForm}
        loading={true}
        schemaName='discountCode'
    >
        <ValidatedInput
            append={<>
                <Button name='change' type="submit" className="relative flex-none z-[1] rounded-none btn-outline-success -ml-px">
                    {props.applyTitle}
                </Button>
                <Button name='remove' type="submit" value='x' className="relative flex-none z-[1] rounded-l-none btn-outline-danger -ml-px"
                    onClick={ev => {
                        console.log('DiscountForm code:', code, '; cart.discount: ', cart.discount)
                        if (!cart.discount) {
                            ev.preventDefault();
                            setCode(emptyString);
                        }
                    }}
                >
                    <Icon name="x" />
                </Button>
            </>}
            className='z-0 rounded-r-none'
            name='discountCode'
            onChange={ev => setCode(ev.target.value)}
            placeholder={props.discountTitle}
            value={code}
        />
    </FormWithSchema>;
}