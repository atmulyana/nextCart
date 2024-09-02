/** 
 * https://github.com/atmulyana/nextCart
 **/
import {notFound} from "next/navigation";
import {getModule} from '@/lib/payments/routes';

export async function GET(request: Request) {
    const module = await getModule(request.headers);
    if (!module.GET) return notFound();
    return module.GET(request);
}
 
export async function POST(request: Request) {
    const module = await getModule(request.headers);
    if (!module.POST) return notFound();
    return module.POST(request);
}