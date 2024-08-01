'use client';
/** 
 * https://github.com/atmulyana/nextCart
 **/
import React from 'react';

export function createAccountCheckboxChange(e: React.ChangeEvent<HTMLInputElement>) {
    const pwdInput = e.target.form?.elements.namedItem('password');
    if (pwdInput) {
        (pwdInput as HTMLInputElement).required = e.target.checked;
    }
}

export function nextToShippingClick(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    const form = document.getElementById('customerInfoForm');
    if (form) {
        (e.target as HTMLButtonElement).disabled = true;
        (form as HTMLFormElement).requestSubmit();
    }
}

export function formSubmitted() {
    const submitBtn = document.getElementById('nextToShippingButton');
    if (submitBtn) (submitBtn as HTMLButtonElement).disabled = false;
}
