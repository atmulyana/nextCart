/** 
 * https://github.com/atmulyana/nextCart
 **/
import {getReviews, getReviewSummary} from './data';
import postHandler from './postHandler';

const serverMethods = {
    getReviews,
    getReviewSummary,
    postHandler,
};

export type TServerMethods = typeof serverMethods;
export default serverMethods;