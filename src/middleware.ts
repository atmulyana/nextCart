/** 
 * https://github.com/atmulyana/nextCart
 **/
import {NextResponse, type NextRequest} from "next/server";
import {renewSessionCookie} from "@/lib/session";

export async function middleware(request: NextRequest) {
    const sessionCookie = renewSessionCookie(request);

    let url = request.url;
    if (request.headers.get('X-Requested-With') == 'expressCartMobile' && request.method == 'GET')
        url += '/data';

    const Url = new URL(request.url);
    request.headers.set('x-request-path', Url.pathname);
    request.headers.set('x-request-query', Url.search);
    const response = NextResponse.rewrite(url, {request})
    response.cookies.set(sessionCookie);
    return response;
}

export const config = {
    matcher: [
        /*
        * Match all request paths except for the ones starting with:
        * - _next/static (static files)
        * - _next/image (image optimization files)
        * - favicon.ico (favicon file)
        * - icon.png (favicon file)
        */
        '/((?!_next/static|_next/image|favicon\\.ico|icon\\.png).*)',
    ],
}