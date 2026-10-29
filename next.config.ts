import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  poweredByHeader: false,
  serverExternalPackages: ['pg', '@prisma/adapter-pg'],
  images: {
    formats: ['image/avif', 'image/webp'],
  },
};

export default nextConfig;
