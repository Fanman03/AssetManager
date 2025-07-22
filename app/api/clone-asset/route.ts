import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { getAssetById, insertAsset } from '@/lib/db';
import type { Asset } from '@/types/asset';

const COOKIE_NAME = 'admin_auth';
const JWT_SECRET = process.env.JWT_SECRET!;

export async function POST(req: NextRequest) {
  try {
    const cookieHeader = req.headers.get('cookie') || '';
    const cookies = Object.fromEntries(
      cookieHeader.split('; ').map(cookie => {
        const [key, ...v] = cookie.split('=');
        return [key, decodeURIComponent(v.join('='))];
      })
    );

    const token = cookies[COOKIE_NAME];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized: No token' }, { status: 401 });
    }

    try {
      jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 });
    }

    const { sourceId, newId } = await req.json();

    if (!sourceId || !newId) {
      return NextResponse.json({ error: 'Missing sourceId or newId' }, { status: 400 });
    }

    const existing = await getAssetById(newId);
    if (existing) {
      return NextResponse.json({ error: 'Asset with this ID already exists' }, { status: 409 });
    }

    const source = await getAssetById(sourceId);
    if (!source) {
      return NextResponse.json({ error: 'Source asset not found' }, { status: 404 });
    }

    // Remove original ID before cloning
    const { _id: _, ...rest } = source;

    const newAsset: Asset = {
      ...rest,
      _id: newId,
    };

    const inserted = await insertAsset(newAsset);

    return NextResponse.json({ success: true, inserted });
  } catch (error) {
    console.error('Clone asset error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
