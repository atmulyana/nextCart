/** 
 * https://github.com/atmulyana/nextCart
 **/
import type {NextRequest} from 'next/server';
import {/*notFound,*/ redirect} from 'next/navigation'
import type {TProductImage} from '@/data/types';
import {isIndexNumber, ResponseMessage} from '@/lib/common';
import {getDefaultImage, getImage} from '@/data/product';

function responseImage(image: TProductImage) {
    return new Response(
        new Uint8Array(image.content.buffer), 
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
    request: NextRequest,
    {params}: {params: Promise<{id: string, index?: string[]}>}
) {
    const {id, index} = await params;
    const searchParams = request.nextUrl.searchParams;
    const invalidIdxIsDefault = searchParams.get('invalid-idx') == 'default';

    const indexes = index || [];
    if (indexes.length > 1 || indexes.length == 1 && !isIndexNumber(indexes[0])) return notFound();

    if (indexes.length > 0) {
        const idx = parseInt(indexes[0], 10);
        const image = await getImage(id, idx);
        if (image) return responseImage(image) 
        else if (image !== null || !invalidIdxIsDefault) return notFound();
    }

    //default image
    const image = await getDefaultImage(id);
    if (image) {
        return responseImage(image);
    }
    else if (image === null) {
        return redirect('/images/placeholder.png');
    }
    else {
        return notFound();
    }
}