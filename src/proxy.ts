/** 
 * https://github.com/atmulyana/nextCart
 **/
export {middleware as proxy} from '@/lib/auth/middleware';

export const config = {
    matcher: [
        /*
        * Match all request paths except for the ones starting with:
        * - /api/auth (next-auth API)
        * - /_next/static (static files)
        * - /_next/image (image optimization files)
        * - /favicon.ico (favicon file)
        * - /icon.(ico|png|jpg|jpeg|svg) (icon file)
        * - /product/[id]/image(/[idx])?  (images of product)
        * - /images  (application public images)
        * - /scripts (application public scripts)
        */
        '/((?!api/auth|_next/static|_next/image|favicon\\.ico|icon\\.(?:ico|png|jpg|jpeg|svg)|product/[a-zA-Z0-9]+/image|images/|scripts/).*)',
        
        /** Needed if `basePath` defined */
        '/',
    ],
}