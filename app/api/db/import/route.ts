import { NextRequest, NextResponse } from 'next/server';
import { importAssetsFromJson } from '@/lib/db';
import type { Asset } from '@/types/asset';
import { verifyAdmin } from '@/lib/auth';

export async function POST(req: NextRequest) {
  // ---- AUTH CHECK ----
  const auth = verifyAdmin(req);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = await req.json();
    const assets: Asset[] = Array.isArray(body) ? body : body.assets;

    if (!Array.isArray(assets)) {
      return NextResponse.json(
        { error: 'Expected JSON array or { assets: Asset[] }' },
        { status: 400 }
      );
    }

    const overwrite = Boolean(body.overwrite);
    const { inserted, replaced } = await importAssetsFromJson(assets, overwrite);

    return NextResponse.json({ ok: true, inserted, replaced });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? 'Unknown error' }, { status: 500 });
  }
}