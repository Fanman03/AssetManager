'use client';

import React, { useMemo, useState } from 'react';
import { TYPE_FALLBACKS, TYPE_ALIASES, GENERIC_FALLBACK } from '@/lib/imageConstants';

type Props = Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> & {
  src?: string | null;
  type?: string | null;
};

export default function SafeAssetImage({ src, type, alt, ...rest }: Props) {
  const candidates = useMemo(() => {
    const list: string[] = [];
    if (src) list.push(src);

    if (type) {
      const t = type.toLowerCase().trim();
      const canonical = TYPE_ALIASES[t] || t;
      if (TYPE_FALLBACKS[canonical]) list.push(TYPE_FALLBACKS[canonical]);
    }

    list.push(GENERIC_FALLBACK);
    return Array.from(new Set(list));
  }, [src, type]);

  const [idx, setIdx] = useState(0);

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const el = e.currentTarget;
    const failedUrl = el.currentSrc || el.src;

    console.warn(
      `[SafeAssetImage] Failed to load candidate ${idx + 1}/${candidates.length}: ${failedUrl}`
    );

    setIdx((i) => {
      if (i < candidates.length - 1) {
        return i + 1;
      } else {
        console.warn('[SafeAssetImage] All candidates exhausted. Showing last/generic fallback.');
        return i; // stay on the last one
      }
    });
  };

  return (
    <img
      {...rest}
      alt={alt ?? ''}
      src={candidates[idx] ?? GENERIC_FALLBACK}
      onError={handleError}
    />
  );
}
