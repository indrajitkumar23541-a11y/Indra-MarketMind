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
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";

type ClerkInstance = ReturnType<typeof useClerk> | null;

interface ClerkErrorLike {
  errors?: Array<{
    message?: string;
    longMessage?: string;
  }>;
  message?: string;
}

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

  // Mode: "main" (default quick view) or "google_chooser" (choose account)
  const [view, setView] = useState<"main" | "google_chooser">("main");
  const [emailInput, setEmailInput] = useState("");
  const [googleCustomEmail, setGoogleCustomEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingType, setLoadingType] = useState<"google" | "email" | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  const handleClose = () => {
    setView("main");
    setEmailInput("");
    setGoogleCustomEmail("");
    setErrorMessage("");
    setIsLoading(false);
    setLoadingType(null);
    closeAuthModal();
  };

  // Instant login handler that fetches real profile avatar and persists session
  const executeLogin = async (email: string, name?: string, type: "google" | "email" = "google") => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    setErrorMessage("");
    setIsLoading(true);
    setLoadingType(type);

    const resolvedName = (name || "").trim() || cleanEmail.split("@")[0]
      .split(/[._-]/)
      .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
      .join(" ");

    const avatarUrl = `https://unavatar.io/${encodeURIComponent(cleanEmail)}`;

    try {
      simulateLogin(cleanEmail, resolvedName, avatarUrl);

      // Async notification to admin endpoint
      try {
        fetch("/api/admin/notify-new-user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: "user_" + cleanEmail.replace(/[^a-zA-Z0-9]/g, "_"),
            name: resolvedName,
            email: cleanEmail,
            joinedAt: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
            method: type === "google" ? "Google Authentication" : "Email Authentication",
          }),
        }).catch(() => {});
      } catch {
        // ignore
      }

      handleClose();
    } catch (err) {
      console.error("Login error:", err);
      setErrorMessage("Authentication failed. Please try again.");
    } finally {
      setIsLoading(false);
      setLoadingType(null);
    }
  };

  // Optional: Clerk External Browser OAuth Redirect
  const handleClerkOAuth = async () => {
    if (!isClerkConfigured || !clerk?.client) {
      executeLogin("indrajitkumar23541@gmail.com", "Indrajit Kumar", "google");
      return;
    }

    setIsLoading(true);
    setLoadingType("google");
    setErrorMessage("");

    try {
      const redirectUrl = `${window.location.origin}/sso-callback`;
      const primaryAuth = authModalMode === "sign-up" ? clerk.client.signUp : clerk.client.signIn;
      try {
        await primaryAuth.authenticateWithRedirect({
          strategy: "oauth_google",
          redirectUrl,
          redirectUrlComplete: "/",
        });
      } catch {
        const altAuth = authModalMode === "sign-up" ? clerk.client.signIn : clerk.client.signUp;
        await altAuth.authenticateWithRedirect({
          strategy: "oauth_google",
          redirectUrl,
          redirectUrlComplete: "/",
        });
      }
    } catch (err: unknown) {
      console.warn("Clerk OAuth redirect error:", err);
      const errObj = err as ClerkErrorLike;
      setErrorMessage(
        errObj?.errors?.[0]?.message ||
        "Could not launch external redirect. Signing in with instant profile."
      );
      // Fallback cleanly to instant login
      setTimeout(() => {
        executeLogin("indrajitkumar23541@gmail.com", "Indrajit Kumar", "google");
      }, 500);
    } finally {
      setIsLoading(false);
      setLoadingType(null);
    }
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

        {/* VIEW 1: GOOGLE ACCOUNT CHOOSER */}
        {view === "google_chooser" ? (
          <div className="space-y-4 animate-in fade-in zoom-in-95 duration-150">
            {/* Google Brand Header */}
            <div className="text-center mb-4">
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-2.5 border border-white/15 shadow-inner">
                <svg className="w-6 h-6 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z" />
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z" />
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.02 0 12s.45 3.82 1.25 5.42l4.03-3.15z" />
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-white font-space tracking-tight">
                Choose a Google Account
              </h3>
              <p className="text-xs text-slate-400 mt-0.5 font-sans">
                to sign in to Indra-MarketMind Terminal
              </p>
            </div>

            {errorMessage && (
              <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                <span className="truncate">{errorMessage}</span>
              </div>
            )}

            {/* Primary Account Card */}
            <button
              type="button"
              disabled={isLoading}
              onClick={() => executeLogin("indrajitkumar23541@gmail.com", "Indrajit Kumar", "google")}
              className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.07] hover:bg-cyan-500/15 border border-cyan-500/30 hover:border-cyan-400/60 transition-all cursor-pointer group text-left shadow-lg disabled:opacity-50"
            >
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src="https://unavatar.io/indrajitkumar23541@gmail.com"
                  alt="Indrajit Kumar"
                  className="w-10 h-10 rounded-full object-cover border-2 border-cyan-400/80 shadow-md shrink-0"
                />
                <div className="min-w-0">
                  <div className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors truncate">
                    Indrajit Kumar
                  </div>
                  <div className="text-xs text-slate-400 font-mono truncate">
                    indrajitkumar23541@gmail.com
                  </div>
                </div>
              </div>

              <div className="text-xs text-cyan-400 font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform shrink-0 ml-2">
                {isLoading && loadingType === "google" ? (
                  <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                ) : (
                  <>
                    <span className="font-space">Sign In</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </div>
            </button>

            {/* Another Account Form */}
            <div className="pt-3 border-t border-white/10">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Or sign in with another Google account:
              </label>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="your.email@gmail.com"
                  value={googleCustomEmail}
                  onChange={(e) => setGoogleCustomEmail(e.target.value)}
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-sans"
                />
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => executeLogin(googleCustomEmail, undefined, "google")}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-indigo-500 hover:from-cyan-300 hover:to-indigo-400 active:scale-95 text-black font-bold text-xs cursor-pointer shadow-sm disabled:opacity-50 shrink-0 font-space"
                >
                  Continue
                </button>
              </div>
            </div>

            {/* Back Button */}
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => setView("main")}
                className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to all options</span>
              </button>
            </div>
          </div>
        ) : (
          /* VIEW 2: FRESH CLEAN MAIN VIEW */
          <div className="animate-in fade-in duration-150">
            {/* Brand Header */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-medium mb-3">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>AI Financial Terminal</span>
              </div>

              <h2 className="text-2xl font-bold text-white font-space tracking-tight">
                {authModalMode === "sign-up" ? "Create Account" : "Welcome Back"}
              </h2>
              <p className="text-xs text-slate-400 mt-1 font-sans">
                Access real-time market sentiment &amp; predictive AI models.
              </p>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="mb-4 p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300 flex items-center gap-2 animate-in fade-in">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                <span className="truncate">{errorMessage}</span>
              </div>
            )}

            {/* 1. Quick 1-Tap Login Card (Indrajit Kumar Profile) */}
            <div className="mb-3">
              <button
                type="button"
                disabled={isLoading}
                onClick={() => executeLogin("indrajitkumar23541@gmail.com", "Indrajit Kumar", "google")}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-white/[0.06] hover:bg-cyan-500/15 border border-cyan-500/30 hover:border-cyan-400/60 transition-all cursor-pointer group text-left shadow-lg disabled:opacity-50"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative shrink-0">
                    <img
                      src="https://unavatar.io/indrajitkumar23541@gmail.com"
                      alt="Indrajit Kumar"
                      className="w-10 h-10 rounded-full object-cover border-2 border-cyan-400/80 shadow-md"
                    />
                    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-[#0A0E1A]" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors truncate">
                      Indrajit Kumar
                    </div>
                    <div className="text-xs text-slate-400 font-mono truncate">
                      indrajitkumar23541@gmail.com
                    </div>
                  </div>
                </div>

                <div className="text-xs text-cyan-400 font-bold flex items-center gap-1.5 shrink-0 ml-2 group-hover:translate-x-1 transition-transform">
                  {isLoading && loadingType === "google" ? (
                    <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                  ) : (
                    <>
                      <span className="font-space">1-Tap Sign In</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </div>
              </button>
            </div>

            {/* 2. Choose Another Google Account Button */}
            <button
              type="button"
              disabled={isLoading}
              onClick={() => setView("google_chooser")}
              className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-white/20 text-xs font-semibold text-slate-300 hover:text-white transition-all cursor-pointer active:scale-[0.98] disabled:opacity-50"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z" />
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z" />
                <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.02 0 12s.45 3.82 1.25 5.42l4.03-3.15z" />
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
              </svg>
              <span>Continue with another Google account</span>
            </button>

            {/* Divider */}
            <div className="relative flex items-center justify-center my-4">
              <div className="border-t border-white/10 w-full" />
              <span className="bg-[#0A0E1A] px-3 text-[11px] text-slate-500 uppercase tracking-wider font-mono">
                or sign in with email
              </span>
              <div className="border-t border-white/10 w-full" />
            </div>

            {/* 3. Clean Direct Email Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                executeLogin(emailInput, undefined, "email");
              }}
              className="space-y-3"
            >
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="name@gmail.com or business email"
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
          </div>
        )}

        {/* Clean Institutional Security Footer */}
        <div className="mt-5 pt-3.5 border-t border-white/5 flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>256-Bit SSL Encrypted • Instant Terminal Access</span>
        </div>
      </div>
    </div>
  );
}
