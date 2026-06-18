import type { MetadataRoute } from 'next';

const appName = process.env.NEXT_PUBLIC_APP_NAME ?? 'Asset Manager';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: appName,
    short_name: appName,
    description: 'Self-hosted asset tracking system.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#0d6efd',
    categories: ['business', 'productivity', 'utilities'],
    icons: [
      {
        src: '/img/favicon.png',
        sizes: '48x48',
        type: 'image/png',
      },
      {
        src: '/img/opengraph.png',
        sizes: '1024x1024',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/img/opengraph.png',
        sizes: '1024x1024',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
