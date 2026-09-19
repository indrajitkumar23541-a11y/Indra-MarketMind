import type { NextConfig } from "next";

const securityHeaders = [
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.clerk.accounts.dev https://challenges.cloudflare.com https://accounts.google.com https://apis.google.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      "img-src 'self' data: blob: https://img.clerk.com https://*.googleusercontent.com https://*.google.com https://images.unsplash.com https://*.yahoo.com https://*.yimg.com",
      "connect-src 'self' https://*.clerk.accounts.dev https://accounts.google.com https://query1.finance.yahoo.com https://query2.finance.yahoo.com wss: ws:",
      "frame-src 'self' https://*.clerk.accounts.dev https://accounts.google.com https://challenges.cloudflare.com",
      "base-uri 'self'",
      "form-action 'self'",
      "object-src 'none'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  // Hide Next.js technology fingerprint to thwart malicious vulnerability scanners
  poweredByHeader: false,

  // Fallback public environment variables for zero-config Vercel deployments
  env: {
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ||
      "pk_test_ZXhwZXJ0LXJhY2VyLTIwNTcuY2xlcmsuYWNjb3VudHMuZGV2JA",
    NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL: "/",
    NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL: "/",
  },

  // Inject hardened security headers across all routes
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;

