'use client';
/** 
 * https://github.com/atmulyana/nextCart
 **/
import React from 'react';
import Button from '@/components/SubmitButton';
import FlexImage from '@/components/FlexImage';
import type {FormProps} from '@/components/Form';
import FormWithSchema from '@/components/FormWithSchema';
import ImageUpload from '@/components/ImageUpload';
import Loading from '@/components/Loading';
import {useModal} from '@/components/Modal';
import {useNotification} from '@/components/Notification';
import {allowedImageTypes} from '@/lib/schemas/all/productImage';
import {isPlainObject} from '@/lib/common';
import {removeImage, setMainImage, uploadImage} from '../actions';

export default function Images({
    imageCount,
    mainIdx,
    onCountChange,
    productId,
    texts,
}: {
    imageCount: number,
    mainIdx: number,
    onCountChange?: (newCount: number) => any,
    texts: {
        deleteConfirm: string,
        delete: string,
        label: string,
        main: string,
        noImage: string,
        popup: {
            cancel: string,
            noFile: string,
            selectFile: string,
            title: string,
            upload: string,
        },
        setMain: string,
        upload: string,
    },
    productId: string,
}) {
    const openDialog = useModal();
    const notify = useNotification();
    const [action, setAction] = React.useState<(() => Promise<any>) | null>(null);
    const [state, _setState] = React.useState({
        count: imageCount,
        mainIdx: 0,
        times: [] as number[],
    });
    const setState = (newState:
        Partial<Omit<typeof state, 'times'>>
        | {addCount: 1}
        | {delIdx: number}
    ) => {
        _setState(oldState => {
            const {times} = oldState;
            let startIdx = times.length;
            if ('addCount' in newState) {
                let count = oldState.count;
                if (count < 0) count = 0;
                newState = {count: count + 1};
                if (oldState.count <= 0) newState.mainIdx = 0;
            }
            if ('delIdx' in newState) {
                startIdx = newState.delIdx;
                let mainIdx = oldState.mainIdx;
                if (mainIdx == newState.delIdx) mainIdx = 0;
                let count = oldState.count - 1;
                if (count < 0) count = 0;
                newState = {count, mainIdx};    
            }
            if ('count' in newState) {
                if (newState.count == oldState.count && Object.keys(newState).length == 1) return oldState;
                times.length = newState.count ?? 0;
            }
            const t = new Date().getTime();
            for (let i = startIdx; i < times.length; i++) times[i] = t;
            return {...oldState, ...newState, times};
        });
    };

    const deleteHandler = async (idx: number) => {
        if (await openDialog({title: texts.deleteConfirm})) {
            return removeImage(productId, idx).then(response => {
                if (isPlainObject(response)) {
                    if (response.messageType == 'success') setState({delIdx: idx});
                }
            });
        }
    }

    const setMainHandler = async (idx: number) => {
        return setMainImage(productId, idx).then(response => {
            if (isPlainObject(response)) {
                if (response.messageType == 'success') setState({mainIdx: idx});
            }
        });
    }

    React.useEffect(() => {
        let count = Math.floor(imageCount);
        if (count < 0) count = 0;
        setState({count});
    //eslint-disable-next-line react-hooks/exhaustive-deps
    }, [imageCount]);

    React.useEffect(() => {
        if (state.count >= 0 && state.count != imageCount && onCountChange) onCountChange(state.count);
    //eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state.count, onCountChange]);

    React.useEffect(() => {
        setState({mainIdx});
    //eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mainIdx]);

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

    const images = [];
    for (let idx = 0; idx < state.count; idx++) {
        images.push(<div key={idx} className='product-image-item flex flex-col basis-full md:basis-1/4 shrink-0 px-2'>
            <div className='flex items-center mb-2'>
                <span className='flex-none'>{idx+1}.&nbsp;</span>
                <Button type='button' className='btn-outline-danger btn-sm flex-1 mr-2'
                    onClick={() => setAction(() => deleteHandler.bind(null, idx))}
                >{texts.delete}</Button>
                {idx == state.mainIdx ? (
                    <strong className='text-center flex-2/3 font-semibold'>{texts.main}</strong>
                ) : (
                    <Button type='button' className='btn-outline-success btn-sm flex-2/3'
                        onClick={() => setAction(() => setMainHandler.bind(null, idx))}
                    >{texts.setMain}</Button>
                )}
            </div>
            <FlexImage src={`/product/${productId}/image/${idx}?t=${state.times[idx]}`} alt={`Image ${idx+1}`} bgClassName='bg-transparent' />
        </div>);
    }

    return <div id='productImages' className='product-images relative flex flex-col mb-4 mx-4'>
        <div className='flex justify-between mb-4'>
            <label className='text-lg'><strong>{texts.label}</strong></label>
            <Button type='button' className='btn-outline-primary'
                onClick={async () => {
                    let resolveSubmit: ((response: Parameters<NonNullable<FormProps['onSubmitted']>>[0]) => void) | undefined;
                    await openDialog({
                        title: texts.popup.title,
                        content: <UploadForm
                            productId={productId}
                            loadingCallback={openDialog.setLoading}
                            noFileText={texts.popup.noFile}
                            onSubmitted={response => resolveSubmit && resolveSubmit(response)}
                            selectFileLabel={texts.popup.selectFile}
                        />,
                        okLabel: texts.popup.upload,
                        okBtnStyle: 'btn-outline-success',
                        cancelLabel: texts.popup.cancel,
                        cancelBtnStyle: 'btn-outline-danger',
                        size: 'lg',
                        onOk: async () => {
                            const form = document.getElementById('uploadImageForm') as HTMLFormElement;
                            if (form) {
                                return await new Promise((resolve: NonNullable<typeof resolveSubmit>) => {
                                    resolveSubmit = resolve;
                                    form.requestSubmit();
                                }).then(response => {
                                    if (response.type != 'success') return false;
                                    setState({addCount: 1});
                                });
                            }
                        },
                    });
                }}
            >{texts.upload}</Button>
        </div>
        {state.count < 0 ? (
            <>&nbsp;</>
        ) : 
        state.count < 1 ? (
            <strong className='text-[var(--color-warning)]'>{texts.noImage}</strong>
        ) : (
            <div className='flex flex-wrap gap-y-4 justify-start -mx-2'>
                {images}
            </div>
        )}

        <Loading isLoading={!!action} />
    </div>;
}

const acceptedImageTypes = allowedImageTypes.join(',');
function UploadForm({
    loadingCallback,
    noFileText,
    onSubmitted,
    productId,
    selectFileLabel,
}: {
    loadingCallback?: FormProps['loadingCallback'],
    noFileText: string,
    onSubmitted?: FormProps['onSubmitted'],
    productId: string,
    selectFileLabel: string,
}) {
    return <FormWithSchema
        action={uploadImage}
        className='block'
        id="uploadImageForm"
        loadingCallback={loadingCallback}
        onSubmitted={onSubmitted}
        schemaName='productImage'
    >
        <input type='hidden' name='productId' value={productId} />
        <ImageUpload accept={acceptedImageTypes} buttonLabel={selectFileLabel} name='image' noFileText={noFileText} />
    </FormWithSchema>;
}