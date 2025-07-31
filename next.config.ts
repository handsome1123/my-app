import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    domains: ['utfs.io'], // ✅ allow images from utfs.io
  },
};

export default nextConfig;
