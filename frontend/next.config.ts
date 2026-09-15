import type { NextConfig } from "next";

const GATEWAY_URL = process.env.GATEWAY_URL || process.env.NEXT_PUBLIC_GATEWAY_URL || 'http://localhost:8000';

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${GATEWAY_URL}/api/:path*`,
      }
    ];
  }
};

export default nextConfig;
