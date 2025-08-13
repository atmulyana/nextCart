'use client';
/** 
 * https://github.com/atmulyana/nextCart
 **/
import '@/styles/image-upload.css';
import React from 'react';
import {setRef} from 'reactjs-common';
import Button from './SubmitButton';
import FlexImage from './FlexImage';
import Input, {type Props as InputProps, Ref} from './SubmittedInput';

type Props<NoValidation extends (boolean | undefined)> =
    Omit<InputProps<NoValidation, string>, 'type'> & {
        buttonLabel?: string,
        imageWidthClass?: string,
        noFileText?: string,
    };

function getFiles(files: FileList | null) {
    const files2: File[] = [];
    if (files) for (let i = 0; i < files.length; i++) files2.push(files[i]);
    return files2;
}

const ImageUpload = React.forwardRef(function ImageUpload<NoValidation extends boolean | undefined = false>(
    {
        accept = 'image/*',
        buttonLabel = 'Select file',
        imageWidthClass = 'w-32',
        noFileText = 'No file selected',
        ...props
    }: Props<NoValidation>,
    ref: Ref<NoValidation, string>
) {
    const input = React.useRef<any>(null);
    const [files, setFiles] = React.useState<File[]>([]);

    React.useEffect(() => {
        setRef(ref, input.current);
        return () => setRef(ref, null);
    }, []);

    return <div className='image-upload'>
        <div className='image-upload-input form-input flex items-center relative' onClick={() => input.current?.click()}>
            <Button type='button' className='flex-none btn-primary btn-sm'>{buttonLabel}...</Button>
            <span className='flex-1 ml-4 overflow-hidden text-ellipsis text-nowrap'>{
                files.length > 0
                    ? files.map(f => f.name).join(', ')
                    : <i className='text-gray-500'>{noFileText}</i>
            }</span>
        </div>
        <Input {...props as InputProps<NoValidation, string>}
            ref={input}
            type='file'
            accept={accept}
            className='hidden'
            onChange={ev => setFiles(getFiles((ev.target as any).value))}
        />
        <div className='flex flex-wrap gap-2 justify-center mt-2'>
            {files.length < 1 ? (
                <div className={imageWidthClass}>
                    <FlexImage src='/images/placeholder.png' alt='No Image' />
                </div>
            ) : (
                files.map((file, idx) => <div key={idx} className={imageWidthClass}>
                    <FlexImage
                        src={file.type.toLowerCase().startsWith('image/') ? URL.createObjectURL(file) : '/images/placeholder.png'}
                        alt={file.name}
                    />
                </div>)
            )}
        </div>
    </div>;
}) as (
    <NoValidation extends (boolean | undefined) = false>(
        props: Props<NoValidation> & {ref?: Ref<NoValidation, string>, key?: React.Key | null}
    ) => React.ReactNode
);
export default ImageUpload;