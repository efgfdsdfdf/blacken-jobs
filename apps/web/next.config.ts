import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  transpilePackages: ['@repo/db', '@repo/types'],
  experimental: {
    // Other experimental options here
  }
};

export default nextConfig;
