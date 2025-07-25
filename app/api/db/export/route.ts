import { NextResponse } from 'next/server';
import { exportAllAssets } from '@/lib/db';

export async function GET() {
    const assets = await exportAllAssets();
    const body = JSON.stringify(assets, null, 2);

    const filename = `assets-${new Date().toISOString().slice(0, 10)}.json`;

    return new NextResponse(body, {
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Content-Disposition': `attachment; filename="${filename}"`
        }
    });
}
