import { getAssetById } from '@/lib/db';
import { TYPE_FALLBACKS, TYPE_ALIASES, GENERIC_FALLBACK } from '@/lib/imageConstants';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  const asset = await getAssetById(id);

  if (!asset) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_DOMAIN}${GENERIC_FALLBACK}`,
      302
    );
  }

  const { Image, Type } = asset;

  const candidates: string[] = [];

  if (typeof Image === 'string') {
    const safeImage = Image.replace(/\\/g, '/');
    candidates.push(
      `https://raw.githubusercontent.com/Fanman03/asset-images/master/${safeImage}.png`
    );
  }

  if (Type) {
    const t = Type.toLowerCase().trim();
    const canonical = TYPE_ALIASES[t] || t;
    if (TYPE_FALLBACKS[canonical]) {
      candidates.push(`${process.env.NEXT_PUBLIC_BASE_DOMAIN}${TYPE_FALLBACKS[canonical]}`);
    }
  }

  candidates.push(`${process.env.NEXT_PUBLIC_BASE_DOMAIN}${GENERIC_FALLBACK}`);

  for (const url of candidates) {
    try {
      const res = await fetch(url, { method: 'HEAD', cache: 'no-store' });
      if (res.ok) {
        return NextResponse.redirect(url, 302);
      }
    } catch {
      // skip
    }
  }

  return NextResponse.redirect(
    `${process.env.NEXT_PUBLIC_BASE_DOMAIN}${GENERIC_FALLBACK}`,
    302
  );
}
