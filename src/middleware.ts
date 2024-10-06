/** 
 * https://github.com/atmulyana/nextCart
 **/
export {middleware} from '@/lib/auth/middleware';

export const config = {
    matcher: [
        /*
        * Match all request paths except for the ones starting with:
        * - /_next/static (static files)
        * - /_next/image (image optimization files)
        * - /favicon.ico (favicon file)
        * - /icon.png (favicon file)
        * - /product/[id]/image(/[idx])?  (images of product)
        * - /images  (application public images)
        * - /scripts (application public scripts)
        */
        '/((?!_next/static|_next/image|favicon\\.ico|icon\\.png|api/auth|product/[a-zA-Z0-9]+/image|images/|scripts/).*)',
    ],
}