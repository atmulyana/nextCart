'use client';
/** 
 * https://github.com/atmulyana/nextCart
 **/
import React from 'react';
import SubmitButton from "@/subview/components/SubmitButton";
import SubmittedInput from "@/subview/components/SubmittedInput";

const Quantity = React.memo(function Quantity() {
    const qtyRef = React.useRef<HTMLInputElement>(null);
    return <div className="w-full flex items-stretch">
        <SubmitButton
            type="button"
            className="btn-primary flex-none z-[1] -mr-px rounded-r-none"
            onClick={() => {
                if (qtyRef.current) {
                    let qty = parseInt(qtyRef.current.value) || 1;
                    qty--;
                    if (qty < 1) qty = 1;
                    qtyRef.current.value = qty.toString();
                }
            }}
        >-</SubmitButton>
        <SubmittedInput
            ref={qtyRef}
            type="number" 
            name="productQuantity"
            defaultValue={1}
            className="flex-1 text-center z-0 rounded-none" 
            maxLength={2}
            onBlur={e => {
                let qty = parseInt(e.target.value) || 1;
                if (qty < 1) qty = 1;
                e.target.value = qty.toString();
            }}
        />
        <SubmitButton
            type="button"
            className="btn-primary flex-none z-[1] -ml-px rounded-l-none"
            onClick={() => {
                if (qtyRef.current) {
                    let qty = parseInt(qtyRef.current.value) || 0;
                    if (qty < 0) qty = 0;
                    qty++;
                    qtyRef.current.value = qty.toString();
                }
            }}
        >+</SubmitButton>
    </div>;
});
export default Quantity;