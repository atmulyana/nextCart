'use server';
/** 
 * https://github.com/atmulyana/nextCart
 **/
import {notFound} from 'next/navigation';
import type {OrderStatus} from '@/data/types';
import {dbTrans} from '@/data/db-conn';
import lang from '@/data/lang';
import {getOrder} from '@/data/order';
import {ResponseMessage} from '@/lib/common';
import {createGetHandler, createPostHandler, type HandlerParams} from '@/lib/routeHandler';
import {clearParams, getParams} from '../data';
import {updateOrder, ApprovalStatus} from '../../';

export const GET = createGetHandler(async ({searchParams, isFromMobile}: HandlerParams<{}, {status: string, value: string, txid: string}>) => {
    if (!isFromMobile) return notFound();
    const formData = new FormData();
    formData.set('status', searchParams.status);
    formData.set('amount', searchParams.value);
    formData.set('txid', searchParams.txid);
    return await POST.response(formData);
});

export const POST = createPostHandler(async (formData, redirect) => {
    const params = await getParams();
    if (!params) return notFound();
    const order = await getOrder(params.pendingOrderId);
    if (!order) return notFound();

    const status = formData.getNumber('status');
    const data: {[p: string]: any} = {
        orderReceivedBtc: formData.getNumber('amount') / 1e8,
    };
    let orderStatus: OrderStatus = 'Pending', approvalStatus = ApprovalStatus.Completed;
    if (status == 2) {
        if (data.orderReceivedBtc < params.expectedBtc) {
            orderStatus = 'Declined';
        }
        else {
            data.orderBlockonomicsTxid = formData.getString('txid') || 'na';
            orderStatus = 'Paid';
            approvalStatus = ApprovalStatus.Approved;
        }
    }
    data.orderStatus = orderStatus;

    await dbTrans(async () => {
        await updateOrder(order._id, data, approvalStatus);
        if (orderStatus == 'Paid') await clearParams();
    });

    if (approvalStatus == ApprovalStatus.Approved) {
        return redirect('/payment/' + params.pendingOrderId);
    }
    else if (orderStatus == 'Declined') {
        return ResponseMessage(lang('Amount not sufficient'), 400);
    }
    else {
        return ResponseMessage(lang('Unfinished payment'), 402);
    }
});

export async function formAction(formData: FormData) {
    return POST.responseJson(formData);
}