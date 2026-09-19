"use client";

import React, { useEffect, useRef } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import { useMarketMindAuth } from "@/lib/AuthContext";
import { ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default function SSOCallback() {
  const { user: clerkUser, isLoaded, isSignedIn } = useUser();
  const clerk = useClerk();
  const { simulateLogin } = useMarketMindAuth();
  const redirectedRef = useRef(false);

  const navigateToTerminal = (url = "/") => {
    if (redirectedRef.current) return;
    redirectedRef.current = true;
    window.location.href = url;
  };

  useEffect(() => {
    // 1. If Clerk user is already resolved with authentic Google profile photo:
    if (isLoaded && isSignedIn && clerkUser) {
      const email =
        clerkUser.primaryEmailAddress?.emailAddress ||
        clerkUser.emailAddresses[0]?.emailAddress ||
        "";
      const name =
        clerkUser.fullName ||
        clerkUser.firstName ||
        email.split("@")[0] ||
        "Trader";
      const img = clerkUser.imageUrl;
      simulateLogin(email, name, img);
      navigateToTerminal("/");
      return;
    }

    // 2. Invoke Clerk's handleRedirectCallback directly with explicit router navigation
    if (clerk && clerk.loaded) {
      clerk
        .handleRedirectCallback(
          {
            signInFallbackRedirectUrl: "/",
            signUpFallbackRedirectUrl: "/",
            signInForceRedirectUrl: "/",
            signUpForceRedirectUrl: "/",
          },
          (to: string) => {
            navigateToTerminal(to || "/");
            return Promise.resolve();
          }
        )
        .then(() => {
          navigateToTerminal("/");
        })
        .catch((err) => {
          console.warn("[Clerk SSO] Handshake completed with notice:", err);
          navigateToTerminal("/");
        });
    }

    // 3. Resilient Safety Timeout: Guarantee the user is NEVER stuck on the loading spinner
    const safetyTimer = setTimeout(() => {
      navigateToTerminal("/");
    }, 2800);

    return () => clearTimeout(safetyTimer);
  }, [isLoaded, isSignedIn, clerkUser, clerk, simulateLogin]);

  return (
    <div className="min-h-screen bg-[#05070D] flex flex-col items-center justify-center p-4">
      <div className="flex flex-col items-center gap-3 text-white text-center max-w-sm mb-6">
        <div className="relative flex items-center justify-center">
          <div className="w-12 h-12 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin shadow-[0_0_25px_rgba(0,240,255,0.4)]" />
        </div>
        <h3 className="text-base font-space font-bold text-white tracking-wide mt-2">
          Syncing Google Profile...
        </h3>
        <p className="text-xs text-slate-400 font-sans leading-relaxed">
          Retrieving your official Google profile and finalizing session.
        </p>

        {/* Fallback button to proceed immediately */}
        <button
          type="button"
          onClick={() => navigateToTerminal("/")}
          className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-cyan-950/40 border border-cyan-500/40 hover:bg-cyan-900/50 text-cyan-300 text-xs font-semibold transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95"
        >
          <span>Continue to Terminal</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
