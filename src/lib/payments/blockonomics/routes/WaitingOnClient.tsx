'use client';
/** 
 * https://github.com/atmulyana/nextCart
 **/
import React from 'react';
import Link from 'next/link';
import Form from '@/subview/components/Form';
import Loading from '@/subview/components/Loading';
import {useNotification} from '@/subview/components/Notification';
import {formAction} from './checkout_return';
import type {TSessionBlockonomics} from '../data';

const AMINUTE = 60 * 1000;
const LIMIT = 10; //minutes

function getEndTime(minutes: number) {
    return new Date().getTime() + AMINUTE * minutes;
}

function copyText(elmId: string) {
    const elm = document.getElementById(elmId);
    if (elm) navigator.clipboard.writeText(elm.innerText);
}

export function CopyLink({
    sourceId,
    title = 'Copy',
    className,
}: {
    sourceId: string,
    title?: string,
    className?: string,
}) {
    return <a
        href='#'
        className={className}
        onClick={e => {
            copyText(sourceId);
            e.preventDefault();
        }}
    >{title}</a>;
}

type TimerProps = {
    isRunning?: boolean,
    timeout: number, //minutes
    onTimeout?: () => void,
};

const Timer = React.memo(function Timer({isRunning = true, timeout, onTimeout = () => {}}: TimerProps) {
    const timerId = React.useRef<NodeJS.Timeout>();
    const [time, setTime] = React.useState(new Date().getTime());
    const [endTime, setEndTime] = React.useState(getEndTime(timeout));

    const stopTimer = React.useCallback(() => {
        if (timerId.current) clearInterval(timerId.current);
        timerId.current = void(0);
    }, []);

    React.useEffect(() => {
        setEndTime(getEndTime(timeout)); //reset
    }, [timeout]);

    React.useEffect(() => {
        if (timerId.current) return; //At first render, this function is called twice
        timerId.current = setInterval(() => {
            const currentTime = new Date().getTime();
            if (currentTime >= endTime) {
                stopTimer();
                typeof(onTimeout) == 'function' && onTimeout();
            }
            else {
                setTime(currentTime);
            }
        }, 1000);

        () => stopTimer();
    }, [onTimeout, endTime, stopTimer]);

    React.useEffect(() => {
        if (!isRunning) stopTimer();
    }, [isRunning, stopTimer]);

    let distance = endTime - time;
    if (distance < 0) distance = 0;
    let minuteFractions = distance % AMINUTE;
    let seconds = Math.floor(minuteFractions / 1000);
    let minutes = (distance - minuteFractions) / AMINUTE;
    return <strong>{minutes}m {seconds}s</strong>;
});

const TimerWrapper = React.memo(function TimerWrapper({wrapperText, ...props}: TimerProps & {wrapperText: string}) {
    let prefix = '', suffix = '';
    const placeholder = '${time}';
    const i = wrapperText.indexOf(placeholder);
    if (i >= 0) {
        prefix = wrapperText.substring(0, i);
        suffix = wrapperText.substring(i + placeholder.length);
    }
    return <>{prefix}<Timer {...props} />{suffix}</>;
});

export default function Waiting({
    blUrl,
    params,
    text,
}: {
    blUrl: string,
    params: NonNullable<TSessionBlockonomics['blockonomicsParams']>,
    text: {
        alreadyPaid: string,
        clickHere: string,
        detected: string,
        expired: string,
        waiting: string,
        order: string,
        retry: string,
        time: string,
        view: string,
    }
}) {
    const formRef = React.useRef<HTMLFormElement>(null);
    const notify = useNotification();
    const blSocket = React.useRef<WebSocket>();
    const closeBlSocket = React.useCallback(() => {
        if (blSocket.current) blSocket.current.close();
        blSocket.current = void(0);
    }, []);
    const [status, setStatus] = React.useState<0|1|2>(0);
    const [data, setData] = React.useState({value: 0, txid: '', status: 0|1|2});
    const [timerIsRunning, stopTimer] = React.useState(true);
    const onTimeout = React.useCallback(() => {
        closeBlSocket();
        notify(text.expired, 'danger');
        setStatus(2); 
    }, [closeBlSocket, notify, text.expired]);
    
    React.useEffect(() => {
        if (data.value > 0) {
            stopTimer(false);
            setStatus(1);
        }
    }, [data]);

    React.useEffect(() => {
        if (status == 1) {
            if (formRef.current) formRef.current.requestSubmit();
        }
    }, [status]);

    React.useEffect(() => {
        (
            blSocket.current = new WebSocket(blUrl + params.address + '?timestamp=' + params.timestamp)
        ).onmessage = function(msg) {
            var data = JSON.parse(msg.data);
            if (data.status === 0 || data.status === 1 || data.status === 2) {
                closeBlSocket();
                notify(text.detected, 'success');
                setData(data);
            }
        };

        return () => closeBlSocket();
    }, [blUrl, params.address, params.timestamp, closeBlSocket, notify, text.detected]);

    return <Form ref={formRef} action={formAction} className='flex flex-col items-center w-full'>
        {status == 1 ? <>
            <div>{text.detected} (<strong>{data.value} / 1e8 BTC</strong>)</div>
            <div>{text.view} <strong><Link href={'/payment/' + params.pendingOrderId}>{text.order}</Link></strong></div>
        </> :
        status == 2 ? <>
            <strong>{text.expired}</strong>
            <div className='mt-6'>
                <strong><Link href='/checkout/payment'>{text.clickHere}</Link></strong> {text.retry}. 
            </div>
            <div className='mt-6'>{text.alreadyPaid}.</div>
        </> : <>
            <div>{text.waiting}</div>
            <div>
                <TimerWrapper wrapperText={text.time} timeout={LIMIT} isRunning={timerIsRunning} onTimeout={onTimeout} />
            </div>
            <div className='relative my-5 w-20 h-20'>
                <Loading isLoading noBackdrop percentSize={100} />
            </div>
        </>}
        
        <input type='hidden' name='status' value={data.status} />
        <input type='hidden' name='amount' value={data.value} />
        <input type='hidden' name='txid' value={data.txid} />
    </Form>;
}