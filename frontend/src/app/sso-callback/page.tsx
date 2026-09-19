"use client";

import React, { useEffect } from "react";
import { AuthenticateWithRedirectCallback, useUser } from "@clerk/nextjs";
import { useMarketMindAuth } from "@/lib/AuthContext";

export const dynamic = "force-dynamic";

export default function SSOCallback() {
  const { user: clerkUser, isLoaded, isSignedIn } = useUser();
  const { simulateLogin } = useMarketMindAuth();

  useEffect(() => {
    // When Clerk completes Google OAuth and resolves authenticated user:
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
      // Genuine Google Account profile picture (e.g. https://lh3.googleusercontent.com/...)
      const img = clerkUser.imageUrl;
      simulateLogin(email, name, img);
      window.location.href = "/";
    }
  }, [isLoaded, isSignedIn, clerkUser, simulateLogin]);

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
      </div>

      <AuthenticateWithRedirectCallback
        signInForceRedirectUrl="/"
        signUpForceRedirectUrl="/"
      />
    </div>
  );
}
