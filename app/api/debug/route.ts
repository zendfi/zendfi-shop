import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET() {
    const headersList = await headers();

    const slug = headersList.get('x-shop-slug') || '(empty)';
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://api.zendfi.tech';
    const url = `${API_BASE}/api/v1/shops/${slug === '(empty)' ? 'blesseds-latest-noodles' : slug}`;

    let fetchResult: unknown;
    try {
        const res = await fetch(url, { cache: 'no-store' });
        const body = await res.text();
        fetchResult = { status: res.status, ok: res.ok, body: body.slice(0, 500) };
    } catch (err) {
        fetchResult = { error: String(err) };
    }

    return NextResponse.json({
        slug,
        api_base: API_BASE,
        fetch_url: url,
        fetch_result: fetchResult,
    });
}
