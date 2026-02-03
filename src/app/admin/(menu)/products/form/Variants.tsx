'use client';
/** 
 * https://github.com/atmulyana/nextCart
 **/
import React from 'react';
import {Tooltip} from "flowbite-react";
import {emptyString} from 'javascript-common';
import {createComponent} from '@react-packages/image-thumbnail';
import Button from '@/components/SubmitButton';
import type {FormProps} from '@/components/Form';
import FormWithSchema from '@/components/FormWithSchema';
import Icon from '@/components/Icon';
import Input from '@/components/SubmittedInput';
import Loading from '@/components/Loading';
import Select from '@/components/SubmittedSelect';
import {useModal} from '@/components/Modal';
import {useNotification} from '@/components/Notification';
import type {TVariant} from '@/data/types';
import {currencySymbol, formatAmount, isPlainObject} from '@/lib/common';
import darkMode from '@/lib/darkMode';
import {removeVariant, saveVariant} from '../actions';

type Props = {
    imageCount: number,
    texts: {
        add: string,
        delete: string,
        deleteConfirm: string,
        edit: string,
        image: string,
        label: string,
        name: string,
        noVariant: string,
        popup: {
            cancel: string,
            image: string,
            imageNote: string,
            name: string,
            nameNote: string,
            price: string,
            save: string,
            stock: string,
            title: string,
        },
        price: string,
        stock: string,
    },
    productId: string,
    productPrice: number,
    variants?: TVariant[],
};
const emptyArray: TVariant[] = [];

function getImage(idx: number) {
    return document.getElementById('productImages')?.querySelectorAll<HTMLImageElement>('.product-image-item img')[idx];
}

export default function Variants({
    imageCount,
    productId,
    productPrice,
    texts,
    variants = emptyArray,
}: Props) {
    const openDialog = useModal();
    const notify = useNotification();
    const [action, setAction] = React.useState<(() => Promise<any>) | null>(null);
    const [items, setItems] = React.useState<TVariant[]>([]);

    React.useEffect(() => {
        setItems(variants);
    }, [variants]);
    
    React.useEffect(() => {
        if (action) {
            action().then(response => {
                if (isPlainObject(response)) {
                    if (response.message) notify(response.message, response.messageType ?? 'danger')
                }
            }).finally(() => {
                setAction(null);
            });
        }
    //eslint-disable-next-line react-hooks/exhaustive-deps
    }, [action]);

    const showVariantForm = async (idx: number) => {
        let variant: TVariant;
        if (idx < 0) {
            variant = {
                _id: emptyString,
                title: emptyString,
                price: productPrice,
                product: productId
            };
        }
        else {
            variant = items[idx];
            variant.product = productId;
            if (!variant) return;
        }
        let resolveSubmit: ((response: Parameters<NonNullable<FormProps['onSubmitted']>>[0]) => void) | undefined;
        await openDialog({
            title: texts.popup.title,
            content: <Form
                imageCount={imageCount}
                loadingCallback={openDialog.setLoading}
                onSubmitted={response => resolveSubmit && resolveSubmit(response)}
                texts={texts.popup}
                variant={variant}
            />,
            okLabel: texts.popup.save,
            okBtnStyle: 'btn-outline-success',
            cancelLabel: texts.popup.cancel,
            cancelBtnStyle: 'btn-outline-danger',
            size: 'lg',
            onOk: async () => {
                const form = document.getElementById('productVariantForm') as HTMLFormElement;
                if (form) {
                    return await new Promise((resolve: NonNullable<typeof resolveSubmit>) => {
                        resolveSubmit = resolve;
                        form.requestSubmit();
                    }).then(response => {
                        if (response.type != 'success') return false;
                        setItems(response.data.variants);
                    });
                }
            },
        });
    };

    const deleteVariant = async (idx: number) => {
        const id = items[idx]?._id.toString();
        if (!id) return;
        if (await openDialog({title: texts.deleteConfirm})) {
            return removeVariant(id, productId).then(response => {
                if (isPlainObject(response)) {
                    if (response.messageType == 'success') setItems(response.variants);
                }
            });
        }
    };

    let imageIdx: number;
    return <div id='productVariants' className='product-variants relative flex flex-col mx-4'>
        <div className='flex justify-between'>
            <label className='text-lg'><strong>{texts.label}</strong></label>
            <Button type='button' className='btn-outline-primary' onClick={() => showVariantForm(-1)}>{texts.add}</Button>
        </div>
        <ul className='bordered'>
            <li className='flex! bg-gray-200 dark:bg-gray-800'>
                <strong className='w-1/4 flex-none pr-4'>{texts.name}</strong>
                <strong className='w-1/4 flex-none pr-4'>{texts.price}</strong>
                <strong className='w-1/4 flex-none pr-4'>{texts.stock}</strong>
                <strong className='flex-1 text-center'>{texts.image}</strong>
                <strong className='flex-none invisible text-right pl-4'>
                    <a href='#'>
                        <Icon name='edit' />
                    </a>&nbsp;<a href='#'>
                        <Icon name='trash-2' />
                    </a>
                </strong>
            </li>
            {items.length < 1 ? (
                <li className='bg-(--bg-color) text-center'>{texts.noVariant}</li>
            ) : items.map((v, idx) => (imageIdx = v.imageIdx ?? -1,
                <li key={v._id as string} className='flex! bg-(--bg-color) hover:bg-gray-100 hover:dark:bg-gray-900'>
                    <span className='w-1/4 flex-none pr-4'>{v.title}</span>
                    <span className='w-1/4 flex-none pr-4'>{currencySymbol()}{formatAmount(v.price)}</span>
                    <span className='w-1/4 flex-none pr-4'>{
                        (v.stock ?? 0) > 0 ? v.stock : <i className='text-gray-500'>N/A</i>
                    }</span>
                    <span className='flex-1 flex justify-center'>{
                        Number.isInteger(imageIdx) && 0 <= imageIdx && imageIdx < imageCount
                            ? (
                                <Tooltip
                                    content={<Thumbnail image={getImage(imageIdx)}  className='w-32' />}
                                    style={darkMode.isDark ? 'dark' : 'light'}
                                >
                                    <a className='cursor-pointer underline'>{texts.image}&nbsp;{imageIdx + 1}</a>
                                </Tooltip>
                            )
                            : <i className='text-gray-500'>N/A</i>
                    }</span>
                    <strong className='flex-none text-right pl-4'>
                        <a href='#' title={texts.edit}
                            onClick={ev => {
                                ev.preventDefault();
                                showVariantForm(idx);
                            }}
                        >
                            <Icon name='edit' />
                        </a>&nbsp;<a href='#' title={texts.delete} className='text-(--color-danger)'
                            onClick={ev => {
                                ev.preventDefault();
                                setAction(() => deleteVariant.bind(null, idx))
                            }}
                        >
                            <Icon name='trash-2' />
                        </a>
                    </strong>
                </li>
            ))}
        </ul>

        <Loading isLoading={!!action} />
    </div>;
}

function Form({
    imageCount,
    loadingCallback,
    onSubmitted,
    texts,
    variant,
}: {
    imageCount: number,
    loadingCallback?: FormProps['loadingCallback'],
    onSubmitted?: FormProps['onSubmitted'],
    texts: Props['texts']['popup'],
    variant: TVariant
}) {
    const [imgIdx, setImgIdx] = React.useState(variant.imageIdx?.toString() ?? emptyString);

    const imageOptions: React.ReactNode[] = [<option key={-1} value={emptyString}>-</option>];
    for (let idx = 0; idx < imageCount; idx++) {
        imageOptions.push(<option key={idx} value={idx}>{idx+1}</option>)
    }

    return <FormWithSchema
        action={saveVariant}
        className='block'
        id='productVariantForm'
        loadingCallback={loadingCallback}
        onSubmitted={onSubmitted}
        schemaName='productVariant'
    >
        <input type='hidden' name='id' value={variant._id.toString()} />
        <input type='hidden' name='product' value={variant.product?.toString()} />
        <div className='flex flex-col mb-4'>
            <label>{texts.name}</label>
            <Input type='text' name='title' value={variant.title} />
            <div className='text-gray-500 dark:text-gray-400'>{texts.nameNote}</div>
        </div>
        <div className='flex flex-col mb-4'>
            <label>{texts.price}</label>
            <Input type='number' name='price' value={variant.price} />
        </div>
        <div className='flex flex-col mb-4'>
            <label>{texts.stock}</label>
            <Input type='number' name='stock' value={variant.stock} />
        </div>
        <div className='flex mb-4'>
            <div className='flex flex-col flex-1'>
                <label>{texts.image}</label>
                <Select name='imageIdx' value={imgIdx} className='w-auto self-start'
                    onChange={ev => setImgIdx(ev.target.value)}
                >
                    {imageOptions}
                </Select>
                <div className='text-gray-500 dark:text-gray-400'>{texts.imageNote}</div>
            </div>
            <Thumbnail image={getImage(parseInt(imgIdx))} className='flex-none w-32' />
        </div>
    </FormWithSchema>;
}

const Thumbnail = createComponent({
    styles: {
        background: {
            className: 'bg-gray-500'
        },
        content: {
            className: 'w-full h-full flex items-center justify-center'
        }
    }
});