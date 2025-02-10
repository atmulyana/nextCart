'use client';
/** 
 * https://github.com/atmulyana/nextCart
 **/
import React from 'react';
import type {TOrder} from '@/data/types';
import PagedList from '@/subview/components/PagedList';
import {currencySymbol, formatAmount, getStatusColor} from '@/lib/common';
import {formatDate} from '@/lib/datetime/client';
import './slide.css';

type TextProps = {
    id: string,
    date: string,
    view: string,
    close: string,
    status: string,
    statuses: {[status: string]: string},
    expectedBTC: string,
    receivedBTC: string,
    bcTxId: string,
    netAmout: string,
    shippingAmount: string,
    totalAmount: string,
    email: string,
    company: string,
    firstName: string,
    lastName: string,
    address1: string,
    address2: string,
    country: string,
    state: string,
    postcode: string,
    phone: string,
    products: string,
    options: string,
    comment: string,
};

type OrdersProps = {
    text: TextProps,
    orders: {
        list: TOrder[],
        isNext: boolean,
        page: number,
    },
};

type OrderProps = {
    order: TOrder,
    isOpen: boolean,
    text: TextProps,
    viewClick: (id: string) => void,
};

const Orders = React.memo(function Orders({orders, text}: OrdersProps) {
    const [data, setData] = React.useState(orders);
    const [selectedId, setSelectedId] = React.useState('');
    const setList = React.useCallback((list: OrdersProps['orders']) => setData(list), []);
    const viewClick = React.useCallback((id: string) => {
        setSelectedId(selectedId == id ? '' : id);
    }, [selectedId]);
    
    React.useEffect(() => {
        setData(orders);
    }, [orders]);
    
    let id: string;
    return <PagedList url='/customer/account/orders' list={data} setList={setList}>
        {data.list.map(order => (id = order._id.toString(),
            <OrderItem 
                key={id}
                order={order}
                isOpen={id == selectedId}
                text={text}
                viewClick={viewClick}
            />
        ))}
    </PagedList>;
});

const OrderItem = React.memo(function OrderItem({
    order,
    isOpen,
    text,
    viewClick,
}: OrderProps) {
    return <div className='bordered !mt-0 !p-0 overflow-hidden'>
        <div className='relative bg-black/5 dark:bg-white/10 border-b border-blurry px-5 py-3 z-10'>
            {text.id}: {order._id.toString()} - {text.date}: {formatDate(order.orderDate)}
            <button
                className='btn-outline-success btn-sm absolute right-5 top-1/2 -translate-y-1/2'
                onClick={() => viewClick(order._id.toString())}
            >
                {isOpen ? text.close : text.view}
            </button>
        </div>
        <ul className={`bordered !m-5 z-0 ${
            isOpen ? 'slide-down' : '!hidden'
        }`}>
            <li>
                <strong>{text.status}:</strong>
                <span
                    className="float-right"
                    style={{color: `var(--color-${getStatusColor(order.orderStatus)})`}}
                >
                    {text.statuses[order.orderStatus] || order.orderStatus}
                </span>
            </li>
            <li>
                <strong>{text.date}:</strong>
                <span className="float-right">{formatDate(order.orderDate)}</span>
            </li>
            <li>
                <strong>{text.id}:</strong>
                <span className="float-right">{order._id.toString()}</span>
            </li>
            {order.orderExpectedBtc && <li>
                <strong>{text.expectedBTC}:</strong>
                <span className="float-right">{order.orderExpectedBtc}</span>
            </li>}
            {order.orderReceivedBtc && <li>
                <strong>{text.receivedBTC}:</strong>
                <span className="float-right">{order.orderReceivedBtc}</span>
            </li>}
            {order.orderBlockonomicsTxid && <li>
                <strong>{text.bcTxId}:</strong>
                <span className="float-right">{order.orderBlockonomicsTxid}</span>
            </li>}
            <li>
                <strong>{text.netAmout}:</strong>
                <span className="float-right">{currencySymbol()}{formatAmount(order.orderTotal - order.orderShipping)}</span>
            </li>
            <li>
                <strong>{text.shippingAmount}:</strong>
                <span className="float-right">{currencySymbol()}{formatAmount(order.orderShipping)}</span>
            </li>
            <li>
                <strong>{text.totalAmount}:</strong>
                <span className="float-right">{currencySymbol()}{formatAmount(order.orderTotal)}</span>
            </li>
            <li>
                <strong>{text.email}:</strong>
                <span className="float-right">{order.orderEmail}</span>
            </li>
            <li>
                <strong>{text.company}:</strong>
                <span className="float-right">{order.orderCompany}</span>
            </li>
            <li>
                <strong>{text.firstName}:</strong>
                <span className="float-right">{order.orderFirstname}</span>
            </li>
            <li>
                <strong>{text.lastName}:</strong>
                <span className="float-right">{order.orderLastname}</span>
            </li>
            <li>
                <strong>{text.address1}:</strong>
                <span className="float-right">{order.orderAddr1}</span>
            </li>
            <li>
                <strong>{text.address2}:</strong>
                <span className="float-right">{order.orderAddr2}</span>
            </li>
            <li>
                <strong>{text.country}:</strong>
                <span className="float-right">{order.orderCountry}</span>
            </li>
            <li>
                <strong>{text.state}:</strong>
                <span className="float-right">{order.orderState}</span>
            </li>
            <li>
                <strong>{text.postcode}:</strong>
                <span className="float-right">{order.orderPostcode}</span>
            </li>
            <li>
                <strong>{text.phone}:</strong>
                <span className="float-right">{order.orderPhoneNumber}</span>
            </li>
            <li>&nbsp;</li>
            <li>
                <strong className="text-teal-500">{text.products}</strong>
            </li>
            {Object.values(order.orderProducts).map((p, i) => 
            <li key={i}>
                {p.quantity} x {p.title}
                {p.variantId && <>
                    &nbsp; &gt; &nbsp;
                    <span className="text-[--color-warning]">{text.options}:</span>
                    {p.variantTitle}
                </>}
                <div className="float-right">{currencySymbol()}{formatAmount(p.totalItemPrice)}</div>
            </li>)}
            {order.orderComment && <li>
                <h4><span className="text-[--color-danger]">{text.comment}:</span> {order.orderComment}</h4>
            </li>}
        </ul>
    </div>;
});

export default Orders;