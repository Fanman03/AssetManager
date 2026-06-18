import { NextRequest, NextResponse } from 'next/server';
import { importSitesFromJson } from '@/lib/db';
import type { Site } from '@/types/site';
import { verifyAdmin } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const auth = verifyAdmin(req);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = await req.json();
    const sites: Partial<Site>[] = Array.isArray(body) ? body : body.sites;

    if (!Array.isArray(sites)) {
      return NextResponse.json(
        { error: 'Expected JSON array or { sites: Site[] }' },
        { status: 400 }
      );
    }

    const overwrite = Boolean(body.overwrite);
    const { inserted, replaced } = await importSitesFromJson(sites, overwrite);

    return NextResponse.json({ ok: true, inserted, replaced });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? 'Unknown error' }, { status: 500 });
  }
}
