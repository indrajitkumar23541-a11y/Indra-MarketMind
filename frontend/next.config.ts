import type { NextConfig } from "next";

const GATEWAY_URL = process.env.GATEWAY_URL || process.env.NEXT_PUBLIC_GATEWAY_URL || 'http://localhost:8000';

const nextConfig: NextConfig = {
  // Ultra-fast Next.js Edge route handlers serve /api natively on Vercel
};

export default nextConfig;
