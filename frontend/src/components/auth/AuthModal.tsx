"use client";

import React, { useState } from "react";
import { useMarketMindAuth } from "@/lib/AuthContext";
import { useClerk } from "@clerk/nextjs";
import {
  X,
  Sparkles,
  ShieldCheck,
  Loader2,
  Mail,
  ArrowRight,
} from "lucide-react";

type ClerkInstance = ReturnType<typeof useClerk> | null;

function ClerkConnectedModal() {
  const clerk = useClerk();
  return <AuthModalInner clerk={clerk} />;
}

function FallbackModal() {
  return <AuthModalInner clerk={null} />;
}

export default function AuthModal() {
  const { isClerkConfigured, isAuthModalOpen } = useMarketMindAuth();

  if (!isAuthModalOpen) return null;

  if (isClerkConfigured) {
    return <ClerkConnectedModal />;
  }

  return <FallbackModal />;
}

function AuthModalInner({ clerk }: { clerk: ClerkInstance }) {
  const {
    closeAuthModal,
    simulateLogin,
    isClerkConfigured,
    authModalMode,
  } = useMarketMindAuth();

  const [emailInput, setEmailInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingType, setLoadingType] = useState<"google" | "email" | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  const handleClose = () => {
    setEmailInput("");
    setErrorMessage("");
    setIsLoading(false);
    setLoadingType(null);
    closeAuthModal();
  };

  // Official Google OAuth Sign-In (Retrieves genuine Google profile & photo)
  const handleGoogleSignIn = async () => {
    setErrorMessage("");
    setIsLoading(true);
    setLoadingType("google");

    if (isClerkConfigured && clerk) {
      try {
        // Attempt 1: Clerk OAuth redirect via standard Google OAuth flow
        if (clerk.client) {
          const redirectUrl = `${window.location.origin}/sso-callback`;
          const primaryAuth = authModalMode === "sign-up" ? clerk.client.signUp : clerk.client.signIn;
          await primaryAuth.authenticateWithRedirect({
            strategy: "oauth_google",
            redirectUrl,
            redirectUrlComplete: "/",
          });
          return;
        }
      } catch (err: unknown) {
        console.warn("Clerk OAuth redirect error, attempting modal popup:", err);
      }

      // Attempt 2: Clerk's native modal popup overlay
      try {
        handleClose();
        clerk.openSignIn({
          fallbackRedirectUrl: "/",
          signUpFallbackRedirectUrl: "/",
        });
        return;
      } catch (e2) {
        console.error("Clerk openSignIn error:", e2);
      }
    }

    setErrorMessage("Could not connect to Google authentication. Please try again or continue with email.");
    setIsLoading(false);
    setLoadingType(null);
  };

  // Direct Email Sign-In (Dynamic profile without hardcoded credentials)
  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = emailInput.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    setErrorMessage("");
    setIsLoading(true);
    setLoadingType("email");

    if (isClerkConfigured && clerk) {
      try {
        handleClose();
        clerk.openSignIn({
          initialValues: { emailAddress: cleanEmail },
          fallbackRedirectUrl: "/",
          signUpFallbackRedirectUrl: "/",
        });
        return;
      } catch (err) {
        console.warn("Clerk email modal error:", err);
      }
    }

    // Direct session fallback with dynamic avatar derived from the user's name
    const resolvedName = cleanEmail
      .split("@")[0]
      .split(/[._-]/)
      .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
      .join(" ");

    const dynamicAvatar = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
      resolvedName
    )}&backgroundColor=00f0ff,4f46e5&textColor=ffffff`;

    simulateLogin(cleanEmail, resolvedName, dynamicAvatar);

    try {
      fetch("/api/admin/notify-new-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: "user_" + cleanEmail.replace(/[^a-zA-Z0-9]/g, "_"),
          name: resolvedName,
          email: cleanEmail,
          joinedAt: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
          method: "Email Authentication",
        }),
      }).catch(() => {});
    } catch {
      // ignore
    }

    handleClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      {/* Interactive Modal Card */}
      <div className="relative w-full max-w-[420px] rounded-3xl bg-[#0A0E1A] border border-cyan-500/25 p-6 sm:p-7 shadow-[0_25px_60px_rgba(0,0,0,0.95)] text-white overflow-hidden">
        {/* Top Glowing Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-indigo-500 to-cyan-400" />

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer z-10"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Section */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-medium mb-2.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>AI Financial Intelligence Terminal</span>
          </div>

          <h2 className="text-2xl font-bold text-white font-space tracking-tight">
            {authModalMode === "sign-up" ? "Create Account" : "Welcome Back"}
          </h2>
          <p className="text-xs text-slate-400 mt-1 font-sans">
            Sign in with Google to sync your real-time terminal &amp; portfolio.
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300 flex items-center gap-2 animate-in fade-in">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
            <span className="truncate">{errorMessage}</span>
          </div>
        )}

        {/* 1. Official Google OAuth Sign-In Button */}
        <div className="mb-4">
          <button
            type="button"
            disabled={isLoading}
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-semibold text-sm transition-all cursor-pointer shadow-[0_4px_20px_rgba(255,255,255,0.15)] active:scale-[0.98] disabled:opacity-60 group"
          >
            {isLoading && loadingType === "google" ? (
              <Loader2 className="w-5 h-5 animate-spin text-slate-900" />
            ) : (
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.02 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
            )}
            <span className="font-space font-bold">Continue with Google</span>
          </button>
        </div>

        {/* Divider */}
        <div className="relative flex items-center justify-center my-4">
          <div className="border-t border-white/10 w-full" />
          <span className="bg-[#0A0E1A] px-3 text-[11px] text-slate-500 uppercase tracking-wider font-mono">
            or sign in with email
          </span>
          <div className="border-t border-white/10 w-full" />
        </div>

        {/* 2. Direct Email Form */}
        <form onSubmit={handleEmailSignIn} className="space-y-3">
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              required
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="name@example.com"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/50 border border-white/10 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors font-sans"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-400 to-indigo-500 hover:from-cyan-300 hover:to-indigo-400 active:scale-95 text-black font-space font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-[0_0_20px_rgba(0,240,255,0.35)] disabled:opacity-50"
          >
            {isLoading && loadingType === "email" ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Signing In...</span>
              </>
            ) : (
              <>
                <span>Continue with Email</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Security Footer */}
        <div className="mt-6 pt-3.5 border-t border-white/5 flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>256-Bit SSL Encrypted • Instant Terminal Access</span>
        </div>
      </div>
    </div>
  );
}
