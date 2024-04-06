/** 
 * https://github.com/atmulyana/nextCart
 **/
import type {Metadata, ResolvedMetadata, ResolvingMetadata} from "next";
import numeral from 'numeral';
import config from '@/config/usable-on-client';

export type GetParam = Record<string, string | string[] | undefined>;
export type RouteParam<P extends GetParam = {}, S extends GetParam = {}> = {
    params: P,
    searchParams: S
};

export type GenerateMetadata<P extends GetParam, S extends GetParam> = (
    props: RouteParam<P, S>,
    parent: ResolvedMetadata
) => Promise<Metadata>;

export function normalizeParamValue(param: GetParam) {
    for (let p in param) {
        const value = param[p];
        if (typeof(value) == 'string') {
            param[p] = decodeURIComponent(value);
        }
        else if (Array.isArray(value)) {
            for (let i = 0; i < value.length; i++) value[i] = decodeURIComponent(value[i]);
        }
    }
}

export function meta(metadata: Metadata, parent?: ResolvedMetadata): Metadata {
    const {title, alternates} = metadata;
    if (title) {
        if (metadata.openGraph) {
            if (!metadata.openGraph.title) metadata.openGraph.title = title;
        }
        else {
            const pOg = parent?.openGraph as any;
            metadata.openGraph = {...pOg, title};
        }
        if (metadata.twitter) {
            if (!metadata.twitter.title) metadata.twitter.title = title;
        }
        else {
            const pX = parent?.twitter as any;
            metadata.twitter = {...pX, title};
        }
    }
    if (alternates?.canonical) {
        const url = typeof(alternates.canonical) == 'object' && !(alternates.canonical instanceof URL) 
            ? alternates.canonical.url : alternates.canonical;
        if (metadata.openGraph) {
            if (!metadata.openGraph.url) metadata.openGraph.url = url;
        }
        else {
            const pOg = parent?.openGraph as any;
            metadata.openGraph = {...pOg, url};
        }
        if (metadata.twitter) {
            if (!metadata.twitter.site) metadata.twitter.site = url.toString();
        }
        else {
            const pX = parent?.twitter as any;
            metadata.twitter = {...pX, site: url.toString()};
        }
    }
    return metadata;
}

export function fnMeta<P extends GetParam = {}, S extends GetParam = {}>(
    metadata: Metadata | GenerateMetadata<P, S>
): (
    props: RouteParam<P, S>,
    parent: ResolvingMetadata
) => Promise<Metadata>  {
    return async function(
        props: RouteParam<P, S>,
        parent: ResolvingMetadata
    ) {
        const pMeta = await parent;
        let cMeta: Metadata;
        if (typeof(metadata) == 'function') {
            if (props.params) normalizeParamValue(props.params);
            if (props.searchParams) normalizeParamValue(props.searchParams);
            cMeta = await metadata(props, pMeta);
        }
        else cMeta = metadata;
        return meta(cMeta, pMeta);
    }
} 

export function ResponseMessage(message: string, params?: (number | {status: number, [p: string]: any})) {
    let status: number = 500,
        props : Object = {};
    if (typeof(params) == 'number') status = params;
    else if (typeof(params) == 'object') {
        ({status, ...props} = params);
    }
    return Response.json({message, ...props}, {status});
}

export function isIndexNumber(param: any) {
    return /^\d+$/.test(param);
}

export function isPlainObject(o: any) {
    return typeof(o) == 'object' && o && Object.getPrototypeOf(o).constructor === Object
}

export function currencySymbol(symbol: string = config.currencySymbol) {
    return symbol || '$';
}

export function formatAmount(amt?: number | null) {
    return amt ? numeral(amt).format('0,000.00') : '0.00';
}

export function fixTags(html: string) {
    return html.replace(/&gt;/g, '>').replace(/&lt;/g, '<');
}

export function snip(text: string | null | undefined) {
    return text && text.length > 155 ? `${text.substring(0, 155)}...` : '';
}