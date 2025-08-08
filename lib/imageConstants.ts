export const TYPE_FALLBACKS: Record<string, string> = {
  laptop: '/img/fallbacks/laptop.webp',
  desktop: '/img/fallbacks/desktop.webp',
  monitor: '/img/fallbacks/monitor.webp',
  wap: '/img/fallbacks/wap.webp',
  switch: '/img/fallbacks/switch.webp',
  printer: '/img/fallbacks/printer.webp',
  ups: '/img/fallbacks/ups.webp',
  server: '/img/fallbacks/server.webp',
};

export const TYPE_ALIASES: Record<string, string> = {
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

export const GENERIC_FALLBACK = '/img/fallbacks/generic.webp';