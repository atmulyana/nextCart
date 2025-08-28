'use client';
/** 
 * https://github.com/atmulyana/nextCart
 **/
import React from 'react';
import {emptyString} from 'javascript-common';
import {useFormStatus} from 'react-dom';
import Button from '@/components/SubmitButton';
import DeleteButton from '@/components/DeleteButton';
import Icon from '@/components/Icon';
import Input from '@/components/SubmittedInput';
import Form from '@/components/Form';
import FormWithSchema from '@/components/FormWithSchema';
import Loading from '@/components/Loading';
import {useNotification} from '@/components/Notification';
import SortedList from '@/components/SortableList';
import type {TMenu} from '@/data/types';
import {isPlainObject} from '@/lib/common';
import {remove, save, updateOrder} from './actions';

type Texts = {
    add: string,
    addTitlePlaceholder: string,
    addLinkPlaceholder: string,
    delete: string,
    deleteQuestion: string,
    menu: string,
    link: string,
    move: string,
    update: string,
};

const ItemLoading = React.memo(({setLoading}: {setLoading: (isLoading: boolean) => any}) => {
    const {pending} = useFormStatus();
    React.useEffect(() => {
        setLoading(pending);
    }, [pending]);
    return null;
});

export default function Menu({
    menu,
    texts,
}: {
    menu: TMenu[],
    texts: Texts,
}) {
    const [itemElms, setItemElms] = React.useState<React.ReactElement[]>([]);
    const [loading, setLoading] = React.useState(false);
    const [action, setAction] = React.useState<(() => Promise<any>) | null>(null);
    const container = React.useRef<HTMLDivElement>(null);
    const notify = useNotification();

    const setItems = React.useCallback((menu: TMenu[]) => {
        setItemElms(menu.map((item, idx) => (
            <MenuItem key={idx} {...{item, setItems, setLoading, texts}} />
        )));
    }, []);

    React.useEffect(() => {
        setItems(menu);
    }, [menu]);

    React.useEffect(() => {
        if (action) {
            action().then(resp => {
                if (isPlainObject(resp)) {
                    if (Array.isArray(resp.menu)) setItems(resp.menu);
                    if ('message' in resp) {
                        notify(resp.message, resp.messageType);
                    }
                }
            }).finally(() => {
                setAction(null);
            });
        }
    }, [action]);

    return <div ref={container} className='relative md:w-2/3'>
        <div className='flex'>
            <a className='btn flex-none mr-2'>
                <div className='h-4 w-4'></div>
            </a>
            <div className='flex flex-wrap gap-2 flex-1'>
                <div className='basis-full sm:basis-1/3 shrink-0'>{texts.menu}</div>
                <div className='basis-full shrink-0 sm:basis-0 sm:grow sm:shrink'>{texts.link}</div>
            </div>
        </div>
        <SortedList
            itemClassName='flex pb-2'
            onSortUpdate={() => {
                setAction(() => {
                    return () => new Promise<any>(resolve => {
                        if (!container.current) return;
                        const formData = new FormData();
                        container.current.querySelectorAll('.update-form input[name=id]').forEach(input => {
                            formData.append('id', (input as HTMLInputElement).value);
                        });
                        resolve(updateOrder(formData));
                    })
                });
            }}
        >
            {itemElms}
        </SortedList>
        <div className='flex mb-2'>
            <a className='btn flex-none mr-2'>
                <div className='h-4 w-4'></div>
            </a>
            <AddForm {...{setItems, setLoading, texts}} />
        </div>
        <Loading isLoading={loading || !!action} />
    </div>
}

const AddForm = React.memo(function AddForm({
    setItems,
    setLoading,
    texts,
}: {
    setItems: (menu: TMenu[]) => any,
    setLoading: (isLoading: boolean) => any,
    texts: Pick<Texts, 'add' | 'addTitlePlaceholder' | 'addLinkPlaceholder'>
}) {
    const [title, setTile] = React.useState(emptyString);
    const [link, setLink] = React.useState(emptyString);

    return <FormWithSchema
        action={save}
        schemaName='menu'
        className='flex flex-wrap gap-2 flex-1'
        loading={<ItemLoading setLoading={setLoading} />}
        onSubmitted={resp => {
            if (resp.data?.menu) setItems(resp.data.menu);
            if (resp.type == 'success') {
                setTile(emptyString);
                setLink(emptyString);
            }
        }}
    >
        <Input name='title' placeholder={texts.addTitlePlaceholder} containerClass='basis-full sm:basis-1/3 shrink-0'
            value={title} onChange={ev => setTile(ev.target.value)}
        />
        <Input name='link' placeholder={texts.addLinkPlaceholder} containerClass='basis-full shrink-0 sm:basis-0 sm:grow sm:shrink'
            value={link} onChange={ev => setLink(ev.target.value)}
        />
        <div className='flex flex-none gap-2'>
            <Button className='btn-outline-success' title={texts.add}>
                <Icon name='plus' />
            </Button>
            <a className='btn'>
                <div className='h-4 w-4'></div>
            </a>
        </div>
    </FormWithSchema>;
});

function MenuItem({
    item,
    setItems,
    setLoading,
    texts,
}: {
    item: TMenu,
    setItems: (menu: TMenu[]) => any,
    setLoading: (isLoading: boolean) => any,
    texts: Pick<Texts, 'delete' | 'deleteQuestion' | 'move' | 'update'>
}) {
    const onSubmitted = React.useCallback((resp: {data?: any}) => {
        if (resp.data?.menu) {
            setItems(resp.data.menu);
            /**
             * NEEDS to be set to `null` because unexpectedly `onSubnitted` is re-invoked in the following scenario:
             * - Delete an item
             * - Add a new item
             * - Drag the new item to the position where the deleted item existed
             * The impact of `onSubnitted` re-invocation is the list will be reverted back to state before the new item
             * was added. It also happens when we updates an item, but in this case, re-invocatiom won't cause a chaos.
             */
            resp.data.menu = null;
        }
    }, [setItems]);
    
    return <>
        <a className='btn flex-none mr-2' title={texts.move}>
            <Icon name='move' />
        </a>
        <FormWithSchema
            action={save}
            schemaName='menu'
            className='flex flex-wrap gap-2 flex-1 update-form'
            loading={<ItemLoading setLoading={setLoading} />}
            onSubmitted={onSubmitted}
        >
            <input type='hidden' name='id' value={item._id} />
            <Input name='title' value={item.title} containerClass='basis-full sm:basis-1/3 shrink-0' />
            <Input name='link' value={item.link} containerClass='basis-full shrink-0 sm:basis-0 sm:grow sm:shrink' />
            <div className='flex flex-none gap-2'>
                <DeleteButton
                    className='btn-outline-danger'
                    form={'deleteMenuForm_' + item._id}
                    question={texts.deleteQuestion}
                    title={texts.delete}
                />
                <Button className='btn-outline-success' title={texts.update}>
                    <Icon name='save' />
                </Button>
            </div>
        </FormWithSchema>
        <Form
            action={remove}
            id={'deleteMenuForm_' + item._id}
            className='hidden'
            loading={<ItemLoading setLoading={setLoading} />}
            onSubmitted={onSubmitted}
        >
            <input type='hidden' name='id' value={item._id} />
        </Form>
    </>;
}