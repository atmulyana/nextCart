/** 
 * https://github.com/atmulyana/nextCart
 **/
//import {notFound} from 'next/navigation'
import type {TProductImage} from '@/data/types';
import {isIndexNumber, ResponseMessage} from '@/lib/common';
import {getDefaultImage, getImage} from '@/data/product';

function responseImage(image: TProductImage) {
    return new Response(
        image.content.buffer, 
        { 
            status: 200,
            headers: {'Content-Type': `image/${image.type}`}
        }
    )
}
function notFound() {
    return ResponseMessage('No Image', 404);
}

export async function GET(
    request: Request,
    {params: {id, index}}: {params: {id: string, index?: string[]}}
) {
    const indexes = index || [];
    if (indexes.length > 1 || indexes.length == 1 && !isIndexNumber(indexes[0])) return notFound();
    if (indexes.length < 1) { //default image
        const image = await getDefaultImage(id);
        if (image) {
            return responseImage(image);
        }
        else if (image === null) {
            return Response.redirect(new URL('/images/placeholder.png', request.url));
        }
        else {
            return notFound();
        }
    }
    else {
        const idx = parseInt(indexes[0], 10);
        const image = await getImage(id, idx);
        return image ? responseImage(image) : notFound();
    }
}