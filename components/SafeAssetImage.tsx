'use client';

import React, { useMemo, useState } from 'react';

type Props = Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> & {
  src?: string | null;
  type?: string | null;
};

const TYPE_FALLBACKS: Record<string, string> = {
  laptop: '/img/fallbacks/laptop.webp',
  desktop: '/img/fallbacks/desktop.webp',
  monitor: '/img/fallbacks/monitor.webp',
  wap: '/img/fallbacks/wap.webp',
  switch: '/img/fallbacks/switch.webp',
  printer: '/img/fallbacks/printer.webp',
  ups: '/img/fallbacks/ups.webp',
  server: '/img/fallbacks/server.webp',
};

const TYPE_ALIASES: Record<string, string> = {
  ap: 'wap',
  'wifi ap': 'wap',
  'access point': 'wap',
  'wireless access point': 'wap',
  computer: 'desktop',
  pc: 'desktop',
  copier: 'printer',
  mfp: 'printer',
  scanner: 'printer',
  'network switch': 'switch',
  'ethernet switch': 'switch',
  'uninterruptible power supply': 'ups',
  battery: 'ups',
};

const GENERIC_FALLBACK = '/img/fallbacks/generic.webp';

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
