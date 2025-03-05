'use client';
/** 
 * https://github.com/atmulyana/nextCart
 **/
import React from 'react';
import cfg from '@/config/usable-on-client';
import {isPlainObject} from '@/lib/common';
import Loading from './Loading';
import {useNotification} from './Notification';

type List = {
    //data: any[], 
    isNext: boolean,
    page: number,
}

//const PagedList = React.memo(
function PagedList<T extends List>({
    children,
    url,
    list,
    setList,
    errorText = 'Error'
}: {
    children: React.ReactNode,
    url: string,
    list?: T,
    setList: ((list: T) => void) | (React.Dispatch<React.SetStateAction<T>>),
    errorText?: string,
}) {
    const [loading, setLoading] = React.useState<-1|0|1>(0);
    const isLoading = React.useCallback(() => loading != 0, [loading]);
    const notify = useNotification();

    React.useEffect(() => {
        if (loading != 0) {
            const page = list ? (loading < 0 ? list.page - 1 : list.page + 1) : 1;
            fetch(`${cfg.baseUrl}${url}/${page}`)
            .then(response => {
                if (!response.ok) throw response;
                return response.json();
            })
            .then(list => {
                setList(list);
            })
            .catch(response => {
                let isNotified = false;

                const showNotification = (data: any) => {
                    if (typeof(data.message) == 'string') {
                        notify(data.message, data.messageType || 'danger');
                        isNotified = true;
                    }
                }

                if (response instanceof Response) {
                    response.json().then(data => {
                        showNotification(data);
                    }).catch(() => {
                        //ignores errors
                    })
                }
                else if (typeof(response) == 'string') {
                    showNotification({message: response});
                }
                else if (isPlainObject(response)) {
                    showNotification(response);
                }

                if (!isNotified) {
                    notify(errorText, 'danger');
                }
            })
            .finally(() => {
                setLoading(0);
            });
        }
    //eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loading]);
    
    return <div className='relative w-full'>
        {children}

        {(list?.isNext || list?.page && list.page > 1) && <div className='flex justify-center gap-2 w-full mt-2'>
            <button
                className='btn-outline-primary'
                disabled={list.page < 2}
                onClick={() => {
                    setLoading(-1);
                }}
            >&laquo;</button>
            <button
                className='btn-outline-primary'
                disabled={!list.isNext}
                onClick={() => {
                    setLoading(1);
                }}
            >&raquo;</button>
        </div>}
        
        <Loading isLoading={isLoading} />
    </div>;
}
//);
export default PagedList;