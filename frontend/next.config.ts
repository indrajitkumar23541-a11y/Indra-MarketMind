import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/system/status',
        destination: 'http://localhost:8000/api/system/status',
      },
      {
        source: '/api/gateway/:path*',
        destination: 'http://localhost:8000/:path*',
      },
      {
        source: '/api/data/:path*',
        destination: 'http://localhost:8001/:path*',
      },
      {
        source: '/api/sentiment/:path*',
        destination: 'http://localhost:8002/:path*',
      },
      {
        source: '/api/analytics/:path*',
        destination: 'http://localhost:8003/:path*',
      },
      {
        source: '/api/forecast/:path*',
        destination: 'http://localhost:8004/:path*',
      },
      {
        source: '/api/alerts/:path*',
        destination: 'http://localhost:8005/:path*',
      },
      {
        source: '/api/rag/:path*',
        destination: 'http://localhost:8006/:path*',
      },
      {
        source: '/api/autotrading/:path*',
        destination: 'http://localhost:8007/:path*',
      },
      {
        source: '/api/multimodal/:path*',
        destination: 'http://localhost:8008/:path*',
      },
      {
        source: '/api/crypto/:path*',
        destination: 'http://localhost:8009/:path*',
      },
      {
        source: '/api/altdata/:path*',
        destination: 'http://localhost:8010/:path*',
      }
    ];
  }
};

export default nextConfig;
