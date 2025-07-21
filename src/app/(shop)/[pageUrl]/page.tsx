/** 
 * https://github.com/atmulyana/nextCart
 **/
import React from 'react';
import {fnMeta} from '@/lib/common';
import {awaitProps, type PromiseProps} from '@/lib/common';
import Template from '@/subview/partials/Template';
import FrontMenu from '@/subview/partials/FrontMenu';
import {GET} from './data/route';

type Props = PromiseProps<Pick<Parameters<typeof GET.data>[0], 'params' | 'searchParams'>>;

export const generateMetadata = fnMeta<{
    pageUrl: string,
}>(async (props) => {
    const data = await GET.data(props);
    return {
        title: data.title,
        description: data.metaDescription,
    };
});

export default async function CustomPage(props: Props) {
    const data = await GET.data(await awaitProps(props));
    return <Template>
        <FrontMenu />
        <div className='relative px-4 pt-7 basis-full md:mx-auto md:basis-2/3 grow-0 shrink-0'
            dangerouslySetInnerHTML={{__html: data.page.pageContent}}
        >
        </div>
    </Template>;
}
