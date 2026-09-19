"use client";

import React, { useEffect } from "react";
import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";

export const dynamic = "force-dynamic";

export default function SSOCallback() {
  useEffect(() => {
    // Safety fallback: if Clerk hasn't redirected within 6 seconds, return to home
    const t = setTimeout(() => {
      window.location.href = "/";
    }, 6000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-h-screen bg-[#05070D] flex flex-col items-center justify-center p-4">
      <div className="flex flex-col items-center gap-3 text-white text-center max-w-sm mb-6">
        <div className="relative flex items-center justify-center">
          <div className="w-12 h-12 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin shadow-[0_0_25px_rgba(0,240,255,0.4)]" />
        </div>
        <h3 className="text-base font-space font-bold text-white tracking-wide mt-2">
          Verifying Identity...
        </h3>
        <p className="text-xs text-slate-400 font-sans leading-relaxed">
          Securing encrypted session with Indra-MarketMind.
        </p>
      </div>

      <AuthenticateWithRedirectCallback
        signInForceRedirectUrl="/"
        signUpForceRedirectUrl="/"
      />
    </div>
  );
}
