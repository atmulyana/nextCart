/** 
 * https://github.com/atmulyana/nextCart
 **/
import React, {CSSProperties} from 'react';
import {useFormStatus} from "react-dom";
import {extendObject, emptyObject} from 'javascript-common';
import {extRefCallback, setRef} from 'reactjs-common';
import {ValidatedInput, type InputProps, type InputRef, type Rules, type StyleProp} from '@react-input-validator/web';
import {extendStyle} from '@react-packages/common';
import {createInput} from '@react-packages/file-upload';
import Icon from './Icon';
import {useSchemaProps} from './SchemaContext';

const labels = {
    noFile: 'No file selected',
    selectFile: 'Select file',
};

function NoFileName() {
    return <div className='flex'>
        <a className='flex-none btn btn-primary btn-sm'>{labels.selectFile}</a>
        <i className='flex-1 ml-4'>{labels.noFile}</i>
    </div>;
}

const FileUpload = createInput({
    moreFile: function({count}) {
        return <>
            <Icon name='menu' />
            <div
                className={`absolute bottom-px left-0.5 rounded-full p-px bg-(--bg-color)
                text-gray-700 dark:text-gray-300 text-xs leading-3 font-extrabold`}
            >{count}</div>
        </>;
    },
    noFileName: <NoFileName />,
    styles: {
        audio: {
            className: 'h-full w-full flex items-center justify-stretch px-8',
        },
        bgView: {
            className: 'bg-gray-500 grow -mx-8 rounded-sm overflow-hidden',
        },
        bgViewSingle: {
            className: 'mx-0',
        },
        buttonMore: {
            className: 'relative flex-none border border-gray-500 rounded-r-sm -ml-px px-1 py-0.5',
        },
        buttonNav: {
            className: 'file-upload-btn-nav',
        },
        container: {
            className: 'flex flex-col-reverse items-stretch gap-0.5 max-w-80',
        },
        containerView: {
            className: 'file-upload-view flex items-center',
        },
        fileItem: {
            className: 'cursor-pointer px-2',
        },
        fileItemViewed: {
            className: 'bg-blue-500 text-white list-disc',
        },
        fileItemText: {
            className: 'inline-block align-top',
        },
        fileList: {
            className: `bg-[var(--bg-color)] text-[var(--fg-color)] border border-gray-500
            outline-gray-300 dark:outline-gray-700 outline-2 px-1 py-0.5 list-inside list-[circle]`,
        },
        fileListBackdrop: {
            className: 'bg-[var(--fg-color)] opacity-50 -z-10',
        },
        fileName: {
            className: 'border border-gray-500 rounded-l-sm grow items-center overflow-hidden text-ellipsis whitespace-nowrap px-1 py-0.5',
        },
        fileNameSingle: {
            className: 'rounded-r-sm',
        },
        image: {
            className: 'h-full w-full object-contain object-center',
        },
        input: {
            className: 'flex',
        },
        text: {
            className: `absolute left-0 top-0 right-0 bottom-0
            bg-[var(--bg-color)] text-[var(--fg-color)] text-xs
            border-2 border-gray-500 overflow-auto p-1`,
        },
        video: {
            className: 'h-full w-full',
        },
        onLoad(styles) {
            const ua = window.navigator.userAgent.toLowerCase();
            const idxWk = ua.indexOf('webkit');
            const wkVer = parseInt(ua.substring(idxWk + "webkit/".length));
            styles.fileItemText = extendStyle(
                styles.fileItemText ?? emptyObject,
                {className: (
                    idxWk < 0 ? '-ms-0.5' :
                    wkVer >= 600 ? '-ms-1.5' : '-ms-3'
                )}
            );
        },
    }
});

type InputPropValue = '';
type InputRefValue = readonly File[];
type InternalRefValue = File[] & {path?: string};
//@ts-ignore: we need to define the new type of `value`
interface FileUploadRef extends HTMLInputElement {
    type: 'file',
    value: InputRefValue,
}
type FileUploadProps = Omit<
    React.ComponentProps<'input'>,
    'defaultChecked' | 'defaultValue' | 'onChange' | 'type' | 'ref' | 'style' | 'value'
> & {
    onChange?: React.ChangeEventHandler<FileUploadRef>,
    type?: 'file',
    style?: StyleProp,
    value?: InputRefValue,
};
type ValidatedFileUploadProps = InputProps<
    FileUploadRef,
    //@ts-ignore: consider that `FileUploadRef` can be casted to `HTMLInputElement`  
    FileUploadProps,
    InputPropValue,
    InputRefValue
>;
type FileInputProps = Omit<ValidatedFileUploadProps, 'Component'>;
type FileInputRef = FileUploadRef & InputRef;

function inputValue(input: HTMLInputElement) {
    return {
        get type(): 'file' {
            return 'file';
        },
        set type(val: 'file') {
        },
        get value() {
            const files: InternalRefValue = [];
            if (input.files) {
                for (let file of input.files) files.push(file); 
            }
            files.path = input.value;
            return files;
        },
        set value(val) {
        },
    }
}

const FileUploadComponent = React.forwardRef(function FileUploadComponent(
    {onChange, style, type, value, ...props}: FileUploadProps,
    ref: React.Ref<FileUploadRef>
) {
    const changeHandler: React.ChangeEventHandler<HTMLInputElement> = ev => {
        if (onChange) {
            const target = ev.target;
            const event = (ev as any) as React.ChangeEvent<FileUploadRef>;
            event.target = extendObject(target, inputValue(target));
            onChange(event);
        }
    };
    const $ref = extRefCallback<HTMLInputElement, Pick<FileUploadRef, 'type' | 'value'>>(
        //@ts-ignore: we need to define the new type of `value`
        ref, /*must not be `null`, refers to `refCallback` in `forwardRef` in "core/Validation.tsx"*/
        _ref => inputValue(_ref)
    );

    return <FileUpload
        {...props}
        ref={$ref}
        onChange={changeHandler}
        style={style as CSSProperties | undefined /* has been converted by `setStyle` (`setStyleDefault`) in `withValidation` */}
        type={type}
        value={value && (value as InternalRefValue).path}
    />;
});
FileUploadComponent.displayName = 'FileUploadComponent';

const ValidatedFileUpload = React.forwardRef(function ValidatedFileUpload(
    props: FileInputProps,
    ref: React.Ref<FileInputRef>
) {
    const InputComponet = ValidatedInput as (
        (
            props: ValidatedFileUploadProps & React.RefAttributes<FileInputRef>
        ) => React.ReactNode
    );
    return <InputComponet {...props} Component={FileUploadComponent} ref={ref} />;
});
ValidatedFileUpload.displayName = 'ValidatedFileUpload';

export type Props<NoValidation extends (boolean | undefined)> = Omit<
    {
        noValidation?: NoValidation,
        selectText: string,
        noFileText: string,
        type?: 'file',
        value?: FileInputProps['value'],
    } & (
        NoValidation extends true
            ? Omit<React.ComponentProps<'input'>, 'type' | 'value'>
            : Omit<FileInputProps, 'rules' | 'style'> & {
                containerClass?: string,
                containerStyle?: CSSProperties,
                className?: string,
                rules?: Rules,
                style?: CSSProperties,
            }
    ),
    'disabled' | 'ref'
>;
export type Ref<NoValidation extends (boolean | undefined)> = NoValidation extends true
    ? React.Ref<HTMLInputElement> : React.Ref<FileInputRef>;

const SubmittedFileUpload = React.forwardRef(function SubmittedFileUpload<NoValidation extends boolean | undefined = false>(
    {
        name,
        noValidation,
        noFileText,
        onChange,
        selectText,
        value,
        ...props
    }: Props<NoValidation>,
    ref: Ref<NoValidation>
) {
    labels.noFile = noFileText;
    labels.selectFile = selectText;
    const inpRef = React.useRef<FileInputRef>(null);
    const {pending} = useFormStatus();
    const getProps = useSchemaProps();
    
    // React.useEffect(() => {
    //     if (!inpRef.current || onChange) return;
    //     if (!inpRef.current.isValid) inpRef.current.clearValidation();
    // }, [onChange, value]);

    if (noValidation) {
        return <FileUpload
            {...(props as React.ComponentProps<'input'>)}
            disabled={pending}
            name={name}
            //@ts-ignore
            onChange={onChange}
            value={value}
            ref={ref as React.Ref<HTMLInputElement>}
        />;
    }
    else {
        const {containerClass, containerStyle, className, style, ...props2} = props as Props<false>,
              props3 = getProps(name);
        return <ValidatedFileUpload
            {...props2}
            {...props3}
            disabled={pending}
            //@ts-ignore
            onChange={onChange}
            rules={props2.rules ?? props3.rules}
            style={{
                $cover: {
                    $class: containerClass,
                    $style: containerStyle,
                },
                $input: {
                    $class: className,
                    $style: style,
                }
            }}
            value={value}
            ref={($ref: FileInputRef | null) => {
                setRef(ref as React.Ref<FileInputRef>, $ref);
                inpRef.current = $ref;
            }}
        />;
    }
}) as (
    <NoValidation extends (boolean | undefined) = false>(
        props: Props<NoValidation> & {ref?: Ref<NoValidation>, key?: React.Key | null}
    ) => React.ReactNode
);
export default SubmittedFileUpload;