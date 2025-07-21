// /app/api/asset-count/route.ts
import { NextResponse } from 'next/server';
import { getAllAssets } from '@/lib/db';

export async function GET() {
  try {
    const assets = await getAllAssets();
    return NextResponse.json({ count: assets.length });
  } catch (err) {
    return NextResponse.json({ count: 0 }, { status: 500 });
  }
}
