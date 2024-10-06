/** 
 * https://github.com/atmulyana/nextCart
 **/
import {notFound} from "next/navigation";
import {getRouteModule} from '@/lib/payments';

export async function GET(request: Request, context?: any) {
    const mod = await getRouteModule(request.headers);
    if (!mod.GET) return notFound();
    return await mod.GET(request, context);
}
 
export async function POST(request: Request, context?: any) {
    const mod = await getRouteModule(request.headers);
    if (!mod.POST) return notFound();
    return await mod.POST(request, context);
}