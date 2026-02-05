import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  trailingSlash: false, // Consistent URLs without trailing slash
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pub-dae4dc46f1b149f981bfbd413762b534.r2.dev',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },
};

export default nextConfig;
