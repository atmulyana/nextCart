/** 
 * https://github.com/atmulyana/nextCart
 **/
import AdminReviews from './AdminReviews';
import {getReviews, getReviewSummary} from './data';
import {addReview} from './postHandler';

const serverStuff = {
    AdminReviews,
    addReview,
    getReviews,
    getReviewSummary,
};

export type TServerStuff = typeof serverStuff;
export default serverStuff;