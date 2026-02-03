/** 
 * https://github.com/atmulyana/nextCart
 **/
import {cookies, headers} from 'next/headers';
import {NextResponse, type NextRequest} from 'next/server';
import {safeUrl} from '@/lib/common';

export async function GET(
    request: NextRequest,
    {params}: {params: Promise<{locale: string}>}
) {
    const {locale} = await params;
    (await cookies()).set('locale', locale, { maxAge: 900000, httpOnly: true, path: '/' });
    const referrer = request.nextUrl.searchParams.get('referrer');
    const host = (await headers()).get('host');
    const baseUrl: URL = request.nextUrl;
    if (host) baseUrl.host = host;
    const url = safeUrl(referrer || '/', {useBasePath: true, base: baseUrl});
    return NextResponse.redirect(url);
}