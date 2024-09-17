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

export function ResponseMessage(message: string, params?: (number | {status?: number, [p: string]: any})) {
    let status: number = 500,
        props : {[p: string]: any} = {};
    if (typeof(params) == 'number') status = params;
    else if (typeof(params) == 'object') {
        ({status = 500, ...props} = params);
    }
    if (message && status == 200 && !props.messageType) props.messageType = 'success';
    return Response.json({message, ...props}, {status});
}

export function safeUrl(url: any, option: {base?: string | URL, default?: string} | string = {}) {
    let Url: URL | undefined;
    if (typeof(option) == 'string') option = {default: option};

    if (option.base == '__OUTSIDE__') {
        if (url instanceof URL) Url = url;
        else if (typeof(url) == 'string') Url = new URL(url);
        if (!Url || Url.protocol != 'https:') throw 'Invalid safe URL: ' + url;
        return Url;
    }

    const baseUrl = new URL(option.base || config.baseUrl || 'http://localhost');
    const defaultUrl = new URL('/', baseUrl);
    Url = typeof(url) == 'string' ? new URL(url.trim() || option.default?.trim() || '/', baseUrl) :
          url instanceof URL      ? url :
                                    defaultUrl;
    if (
        Url.host != baseUrl.host ||
        Url.port != baseUrl.port ||
        Url.protocol != baseUrl.protocol ||
        !Url.hostname ||
        Url.username ||
        Url.password
    ) Url = defaultUrl;
    return Url;
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

const reVarNameHolders = /\$\{([_a-zA-Z][_a-zA-Z0-9]*)\}/g;
export const str = (template: string | null | undefined, params: {[name: string]: any}): string | null | undefined => template &&
    template.replace(reVarNameHolders, function(_, p1: string): string {
        let value = params[p1];
        if (typeof(value) == 'function') return value() + '';
        if (value !== null && value !== undefined) return value + '';
        return '';
    });

const statusColors: {[status: string]: string} = {
    Paid: 'success',
    Approved: 'success',
    'Approved - Processing': 'success',
    Failed: 'danger',
    Completed: 'success',
    Shipped: 'success',
    Pending: 'warning',
};
export function getStatusColor(status: string) {
    return statusColors[status] || 'danger';
}