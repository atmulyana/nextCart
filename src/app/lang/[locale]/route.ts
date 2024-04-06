/** 
 * https://github.com/atmulyana/nextCart
 **/
import {cookies} from 'next/headers';
import {NextResponse, type NextRequest} from 'next/server';

export async function GET(
    request: NextRequest,
    {params: {locale}}: {params: {locale: string}}
) {
    cookies().set('locale', locale, { maxAge: 900000, httpOnly: true, path: '/' });
    const referrer = request.nextUrl.searchParams.get('referrer');
    return NextResponse.redirect(new URL(referrer || '/', request.url));
}