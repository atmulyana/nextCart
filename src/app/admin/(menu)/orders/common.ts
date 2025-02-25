/** 
 * https://github.com/atmulyana/nextCart
 **/
import lang from "@/data/lang";
import {getOrderStatuses} from "@/lib/common";

export function getStatusText(status: string) {
    return status.split('-').map(s => lang(s.trim())).join(' - ');
}

export function getStatusOptions() {
    return getOrderStatuses().map(s => ({
        value: s,
        label: getStatusText(s),
    }));
}