"use client";

import React, { useEffect, useState } from "react";
import { HandleSSOCallback } from "@clerk/react";
import { useUser } from "@clerk/nextjs";
import { useMarketMindAuth } from "@/lib/AuthContext";
import { ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default function SSOCallback() {
  const { user: clerkUser, isLoaded, isSignedIn } = useUser();
  const { simulateLogin } = useMarketMindAuth();
  const [showManualProceed, setShowManualProceed] = useState(false);

  const navigateToTerminal = (url = "/") => {
    window.location.href = url;
  };

  // If user is already loaded and authenticated, sync to local state immediately
  useEffect(() => {
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
    }
  }, [isLoaded, isSignedIn, clerkUser, simulateLogin]);

  // Give generous timeout for slow network/mobile connections before showing fallback button
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowManualProceed(true);
    }, 7000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#05070D] flex flex-col items-center justify-center p-4">
      {/* Clerk's official SSO state handler: automatically handles sign-in, transfer to sign-up, and finalization */}
      <HandleSSOCallback
        navigateToApp={(...args: unknown[]) => {
          const first = args[0] as { decorateUrl?: (url: string) => string } | string | undefined;
          let target = "/";
          if (typeof first === "string") {
            target = first;
          } else if (first && typeof first.decorateUrl === "function") {
            target = first.decorateUrl("/");
          }
          navigateToTerminal(target);
        }}
        navigateToSignIn={(...args: unknown[]) => {
          const first = args[0] as { decorateUrl?: (url: string) => string } | string | undefined;
          let target = "/";
          if (typeof first === "string") {
            target = first;
          } else if (first && typeof first.decorateUrl === "function") {
            target = first.decorateUrl("/");
          }
          navigateToTerminal(target);
        }}
        navigateToSignUp={(...args: unknown[]) => {
          const first = args[0] as { decorateUrl?: (url: string) => string } | string | undefined;
          let target = "/";
          if (typeof first === "string") {
            target = first;
          } else if (first && typeof first.decorateUrl === "function") {
            target = first.decorateUrl("/");
          }
          navigateToTerminal(target);
        }}
      />

      <div className="flex flex-col items-center gap-3 text-white text-center max-w-sm mb-6">
        <div className="relative flex items-center justify-center">
          <div className="w-12 h-12 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin shadow-[0_0_25px_rgba(0,240,255,0.4)]" />
        </div>
        <h3 className="text-base font-space font-bold text-white tracking-wide mt-2">
          Syncing Google Profile...
        </h3>
        <p className="text-xs text-slate-400 font-sans leading-relaxed">
          Finalizing secure authentication and retrieving official profile.
        </p>

        {showManualProceed && (
          <button
            type="button"
            onClick={() => navigateToTerminal("/")}
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-cyan-950/40 border border-cyan-500/40 hover:bg-cyan-900/50 text-cyan-300 text-xs font-semibold transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95 animate-in fade-in"
          >
            <span>Continue to Terminal</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

