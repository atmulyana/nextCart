/** 
 * https://github.com/atmulyana/nextCart
 **/
import {notFound} from "next/navigation";
import {getRouteModule} from '@/lib/payments';

export async function GET(request: Request, context?: any) {
    const module = await getRouteModule(request.headers);
    if (!module.GET) return notFound();
    return await module.GET(request, context);
}
 
export async function POST(request: Request, context?: any) {
    const module = await getRouteModule(request.headers);
    if (!module.POST) return notFound();
    return await module.POST(request, context);
}