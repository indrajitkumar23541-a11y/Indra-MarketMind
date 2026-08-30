import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/analytics/:path*',
        destination: 'http://localhost:8003/:path*',
      },
      {
        source: '/api/data/:path*',
        destination: 'http://localhost:8001/:path*',
      }
    ]
  }
};

export default nextConfig;
