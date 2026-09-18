import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

interface RateLimitBucket {
  count: number;
  resetAt: number;
}

// In-memory sliding window rate limit cache (per client IP)
const rateLimitMap = new Map<string, RateLimitBucket>();

// Clean up stale IP records every 2 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, val] of rateLimitMap.entries()) {
      if (now > val.resetAt) {
        rateLimitMap.delete(key);
      }
    }
  }, 120_000);
}

function checkRateLimit(
  ip: string,
  isHeavyApi: boolean
): { allowed: boolean; remaining: number; retryAfter?: number; limit: number } {
  const now = Date.now();
  const windowMs = 60_000; // 1-minute window
  const limit = isHeavyApi ? 25 : 100; // 25 req/min for AI Copilot/forecast, 100 req/min for standard APIs
  const bucketKey = `${ip}:${isHeavyApi ? "heavy" : "std"}`;

  const current = rateLimitMap.get(bucketKey);

  if (!current || now > current.resetAt) {
    rateLimitMap.set(bucketKey, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, limit };
  }

  if (current.count >= limit) {
    const retryAfter = Math.ceil((current.resetAt - now) / 1000);
    return { allowed: false, remaining: 0, retryAfter: Math.max(1, retryAfter), limit };
  }

  current.count++;
  return { allowed: true, remaining: limit - current.count, limit };
}

// Suspicious patterns (Path traversal, null byte, script injection in URL)
const SUSPICIOUS_PATTERNS = [
  /\.\./,           // Directory traversal ../
  /%2e%2e/i,       // URL-encoded ../
  /%00/,           // Null byte
  /<script/i,      // XSS tag in URL
  /\bexec\s*\(/i,  // Code execution attempt
  /\bunion\s+select/i, // Basic SQLi attempt
];

const baseMiddleware = async (req: NextRequest) => {
  const pathname = req.nextUrl.pathname;
  const search = req.nextUrl.search;

  // 1. Anti-Injection & Path Traversal Guard
  for (const pattern of SUSPICIOUS_PATTERNS) {
    if (pattern.test(pathname) || pattern.test(search)) {
      return NextResponse.json(
        {
          error: "Malicious request signature detected and blocked.",
          shield: "Indra-MarketMind CyberShield",
          status: 400,
        },
        { status: 400 }
      );
    }
  }

  // 2. Edge Rate Limiter for API Routes (skip Clerk auth proxy and static pages)
  if (pathname.startsWith("/api/") && !pathname.startsWith("/__clerk")) {
    const forwardedFor = req.headers.get("x-forwarded-for");
    const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : req.headers.get("x-real-ip") || "127.0.0.1";

    const isHeavyApi =
      pathname.startsWith("/api/chat") ||
      pathname.startsWith("/api/copilot") ||
      pathname.startsWith("/api/forecast") ||
      pathname.includes("sentiment/analyze/ensemble");

    const rateResult = checkRateLimit(ip, isHeavyApi);

    if (!rateResult.allowed) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded. Too many requests, please slow down.",
          retryAfterSeconds: rateResult.retryAfter,
          shield: "Indra-MarketMind CyberShield (DDoS & Abuse Prevention)",
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateResult.retryAfter),
            "X-RateLimit-Limit": String(rateResult.limit),
            "X-RateLimit-Remaining": "0",
          },
        }
      );
    }
  }

  // Proceed with standard Next.js lifecycle
  return NextResponse.next();
};

const hasClerk = Boolean(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.startsWith("pk_")
);

export default hasClerk
  ? clerkMiddleware(async (_auth, req: NextRequest) => {
      return baseMiddleware(req);
    })
  : baseMiddleware;

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes and Clerk proxy
    "/(api|trpc)(.*)",
    "/__clerk/:path*",
  ],
};

