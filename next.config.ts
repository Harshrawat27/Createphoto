import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pub-dae4dc46f1b149f981bfbd413762b534.r2.dev',
      },
    ],
  },
};

export default nextConfig;
