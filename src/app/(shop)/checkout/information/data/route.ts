/** 
 * https://github.com/atmulyana/nextCart
 **/
import {countries} from 'countries-list';
import {createGetHandler, type HandlerParams} from '@/lib/routeHandler';
import {generateMetadata} from '../page';

export const GET = createGetHandler(async ({
    isFromMobile
} : HandlerParams<{}>) => {
    return isFromMobile ? {
        title: generateMetadata().title,
        countryList: Object.values(countries).map(c => c.name),
    } : {
    };
});