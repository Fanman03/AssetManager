import { NextRequest, NextResponse } from 'next/server';
import { getAssetById, insertAsset } from '@/lib/db';
import type { Asset } from '@/types/asset';
import { verifyAdmin } from '@/lib/auth';

export async function POST(req: NextRequest) {
const auth = verifyAdmin(req);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
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
