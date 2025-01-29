/** 
 * https://github.com/atmulyana/nextCart
 **/
import {type ObjectId, toId} from '@/data/db-conn';
import modules from '@/lib/modules/server';
import {createPostHandler} from '@/lib/routeHandler';

export const POST = createPostHandler(async (formData) => {
    if (modules.reviews) {
        const {getReviews, getReviewSummary, postHandler} = modules.reviews;
        const response = await postHandler(formData);
        if (response.ok) {
            const data = await response.json();
            const productId = toId(formData.getString('product')) as ObjectId;
            return Response.json(
                {
                    ...data,
                    ...(await getReviews(productId)),
                    ...(await getReviewSummary(productId))
                },
                {
                    status: response.status
                }
            );
        }
        return response;
    }
});