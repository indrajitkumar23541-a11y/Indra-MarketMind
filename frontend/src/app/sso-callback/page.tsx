"use client";

import React, { useEffect, useState } from "react";
import { AuthenticateWithRedirectCallback, useUser } from "@clerk/nextjs";
import { useMarketMindAuth } from "@/lib/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";

export const dynamic = "force-dynamic";

export default function SSOCallback() {
  const { isClerkConfigured, isSignedIn } = useMarketMindAuth();
  const { isSignedIn: clerkSignedIn, isLoaded: clerkLoaded } = useUser();
  const router = useRouter();
  const [showManualButton, setShowManualButton] = useState(false);

  // 1. If user is signed in, redirect to home immediately
  useEffect(() => {
    if (isSignedIn || (clerkLoaded && clerkSignedIn)) {
      router.replace("/");
    }
  }, [isSignedIn, clerkLoaded, clerkSignedIn, router]);

  // 2. Fallback timer: if not Clerk configured, or after timeout, redirect home
  useEffect(() => {
    if (!isClerkConfigured) {
      router.replace("/");
      return;
    }

    const buttonTimer = setTimeout(() => {
      setShowManualButton(true);
    }, 2000);

    const autoRedirectTimer = setTimeout(() => {
      window.location.href = "/";
    }, 4000);

    return () => {
      clearTimeout(buttonTimer);
      clearTimeout(autoRedirectTimer);
    };
  }, [isClerkConfigured, router]);

  return (
    <div className="min-h-screen bg-[#05070D] flex items-center justify-center p-4">
      <div className="flex flex-col items-center gap-3 text-white text-center max-w-sm">
        <div className="relative flex items-center justify-center">
          <div className="w-12 h-12 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin shadow-[0_0_25px_rgba(0,240,255,0.4)]" />
          <ShieldCheck className="w-5 h-5 text-cyan-400 absolute animate-pulse" />
        </div>
        <h3 className="text-base font-space font-bold text-white tracking-wide mt-2">
          Verifying Identity...
        </h3>
        <p className="text-xs text-slate-400 font-sans leading-relaxed">
          Securing encrypted institutional session with Indra-MarketMind.
        </p>

        {showManualButton && (
          <Link
            href="/"
            onClick={() => { window.location.href = "/"; }}
            className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white text-xs font-semibold shadow-[0_0_20px_rgba(0,240,255,0.3)] hover:brightness-110 active:scale-95 transition-all"
          >
            <span>Enter Terminal</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        )}

        {isClerkConfigured && (
          <div className="hidden">
            <AuthenticateWithRedirectCallback
              signInForceRedirectUrl="/"
              signUpForceRedirectUrl="/"
              continueSignUpUrl="/"
            />
          </div>
        )}
      </div>
    </div>
  );
}
