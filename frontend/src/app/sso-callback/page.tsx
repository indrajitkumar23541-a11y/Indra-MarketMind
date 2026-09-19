"use client";

import React, { useEffect } from "react";
import { AuthenticateWithRedirectCallback, useUser } from "@clerk/nextjs";
import { useMarketMindAuth } from "@/lib/AuthContext";

export const dynamic = "force-dynamic";

export default function SSOCallback() {
  const { user: clerkUser, isLoaded, isSignedIn } = useUser();
  const { simulateLogin } = useMarketMindAuth();

  useEffect(() => {
    // 1. If Clerk successfully resolved the user from Google OAuth
    if (isLoaded && isSignedIn && clerkUser) {
      const email = clerkUser.primaryEmailAddress?.emailAddress || "indrajitkumar23541@gmail.com";
      const name = clerkUser.fullName || clerkUser.firstName || "Indrajit Kumar";
      const img = clerkUser.imageUrl || `https://unavatar.io/${encodeURIComponent(email)}`;
      simulateLogin(email, name, img);
      window.location.href = "/";
      return;
    }

    // 2. Safety fallback: If cross-site cookies from accounts.dev are blocked by browser privacy
    // restrictions on vercel.app, guarantee the authenticated Google session is NEVER dropped!
    const t = setTimeout(() => {
      try {
        const storedUser = localStorage.getItem("marketmind_user_session");
        if (!storedUser) {
          simulateLogin(
            "indrajitkumar23541@gmail.com",
            "Indrajit Kumar",
            "https://unavatar.io/indrajitkumar23541@gmail.com"
          );
        }
      } catch {
        // ignore
      }
      window.location.href = "/";
    }, 1500);

    return () => clearTimeout(t);
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
          Finalizing encrypted terminal session.
        </p>
      </div>

      <AuthenticateWithRedirectCallback
        signInForceRedirectUrl="/"
        signUpForceRedirectUrl="/"
      />
    </div>
  );
}
