/** 
 * https://github.com/atmulyana/nextCart
 **/
import {notFound} from 'next/navigation';
import config from '@/config';
import {createGetHandler, type HandlerParams} from '@/lib/routeHandler';
import {getMenu, sortMenu} from '@/data/menu';
import {getPage} from '@/data/page';

type Return = {
    title: string,
    page: {
        pageContent: string,
    },
    metaDescription: string,
    menu?: {
        items: ReturnType<typeof sortMenu>,
    },
};

export const GET = createGetHandler(async ({
    params: {pageUrl},
    isFromMobile
} : HandlerParams<{
    pageUrl: string,
}>) => {
    const page = await getPage(pageUrl);
    if (!page) return notFound();

    const ret: Return = {
        title: page.name,
        page: {
            pageContent: page.content,
        },
        metaDescription: `${config.cartTitle} - ${page.name}`,
    };
    if (isFromMobile) {
        ret.menu = {
            items: sortMenu(await getMenu()),
        };
    }
    return ret;
});