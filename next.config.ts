// next.config.ts or next.config.js (with JSDoc)

import type { NextConfig } from 'next';
import type { Configuration } from 'webpack';
import path from 'path';

const nextConfig: NextConfig = {
  webpack: (config: Configuration) => {
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      '@': path.resolve(__dirname),
    };
    return config;
  },
};

export default nextConfig;
