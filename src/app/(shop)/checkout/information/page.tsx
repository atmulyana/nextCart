/** 
 * https://github.com/atmulyana/nextCart
 **/
import React from 'react';
import Link from 'next/link';
import {loginCustomer, logoutCustomer, saveCheckoutInfo} from '@/app/actions';
import lang from '@/data/lang';
import {getCartHeader} from '@/data/cart';
import {getSession} from '@/data/session';
import Form from '@/subview/components/Form';
import FormWithSchema from '@/subview/components/FormWithSchema';
import Button from '@/subview/components/SubmitButton';
import TextArea from '@/subview/components/SubmittedTextArea';
import Input from '@/subview/components/SubmittedInput';
import CustomerDataForm from '@/subview/partials/CustomerDataForm';
import Template from '@/subview/partials/Template';
import {createAccountCheckboxChange, formSubmitted, nextToShippingClick} from './formEvents';

export function generateMetadata() {
    return {
        title: `${lang('Checkout', 1)} - ${lang('Information')}`,
    };
};

export default async function CheckoutInformation() {
    const session = await getSession();
    const cart = await getCartHeader();

    return <Template>
        <div className='bordered'>
            <h5 className='mb-4'>{lang('Customer details')}</h5>
            
        {session.customerPresent ? (
            <Form action={logoutCustomer} className='block'>
                <input type='hidden' name='referrerUrl' value='/checkout/information' />
                <div className='checkout-buttons'>
                    <Button className='btn-primary'>{lang('Change customer')}</Button>
                </div> 
            </Form>
        ) : (
            <FormWithSchema action={loginCustomer} className='block' schemaName='login'>
                <input type='hidden' name='referrerUrl' value='/checkout/information' />
                <p className='mb-4'>{lang('Existing customer')}</p>
                <div className='mb-4'>
                    <Input type='text' name='loginEmail' placeholder={lang('Email address')} />
                </div>
                <div className='mb-4'>
                    <Input type='text' name='loginPassword' placeholder={lang('Password')} />
                </div>
                <div className='checkout-buttons'>
                    <Link href='/customer/forgotten' className='btn btn-primary'>{lang('Forgotten')}</Link>
                    <Button className='btn-primary'>{lang('Login')}</Button>
                </div>
            </FormWithSchema>
        )}

            <FormWithSchema 
                id='customerInfoForm'
                action={saveCheckoutInfo}
                className='block'
                onSubmitted={formSubmitted}
                schemaName='checkoutInfo'
            >
                <input type='hidden' name='customerId' value={session.customerId?.toHexString() || ''} />
                <CustomerDataForm data={session} />
                <div className='flex -mx-4'>
                    <div className='basis-full grow-0 shrink-0 mb-4 px-4'>
                        <TextArea name='orderComment' value={cart?.orderComment ?? ''} placeholder={lang("Order comment")} /> 
                    </div>
                </div>
                
                {!session.customerPresent && <div className='flex flex-wrap -mx-4'>
                    <div className='basis-full grow-0 shrink-0 mb-4 px-4 text-gray-500'>
                        {lang('Enter a password to create an account for next time')}
                    </div>
                    <div className='basis-full md:basis-1/2 grow-0 shrink-0 mb-4 px-4'>
                        <Input type='password' name='password' placeholder={lang('Password')} />
                    </div>
                    <div className='basis-full md:basis-1/2 grow-0 shrink-0 mb-4 px-4 flex items-center'>
                        <Input name='createAccount' id="createAccountCheckbox" type='checkbox' value='1' onChange={createAccountCheckboxChange} />
                        <label htmlFor='createAccountCheckbox' className='ml-1'>{lang('Create account')}</label>
                    </div>
                </div>}
            </FormWithSchema>
        </div>
        <div className='checkout-buttons'>
            <Link href='/checkout/cart' className='btn btn-primary'>{lang('Return to cart')}</Link>
            <Button id='nextToShippingButton' className='btn-primary' onClick={nextToShippingClick}>{lang('Continue to shipping')}</Button>
        </div>
    </Template>;
}