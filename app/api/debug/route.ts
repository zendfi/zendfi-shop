import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET() {
    const headersList = await headers();
    const all: Record<string, string> = {};
    headersList.forEach((value, key) => {
        all[key] = value;
    });
    return NextResponse.json({ headers: all }, { status: 200 });
}
