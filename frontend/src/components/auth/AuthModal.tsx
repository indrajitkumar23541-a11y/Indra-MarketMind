"use client";

import React, { useState } from "react";
import { useMarketMindAuth } from "@/lib/AuthContext";
import { useClerk } from "@clerk/nextjs";
import { X, Loader2, Phone } from "lucide-react";

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
  const [loadingType, setLoadingType] = useState<"google" | "apple" | "phone" | "email" | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  const handleClose = () => {
    setEmailInput("");
    setErrorMessage("");
    setIsLoading(false);
    setLoadingType(null);
    closeAuthModal();
  };

  // 1. Google OAuth: Triggers native Google account chooser (all Gmails on device)
  const handleGoogleSignIn = async () => {
    setErrorMessage("");
    setIsLoading(true);
    setLoadingType("google");

    if (isClerkConfigured && clerk) {
      try {
        if (clerk.client) {
          const redirectUrl = `${window.location.origin}/sso-callback`;
          const primaryAuth = authModalMode === "sign-up" ? clerk.client.signUp : clerk.client.signIn;
          await primaryAuth.authenticateWithRedirect({
            strategy: "oauth_google",
            redirectUrl,
            redirectUrlComplete: "/",
            continueSignUp: true,
            continueSignIn: true,
          });
          return;
        }
      } catch (err: unknown) {
        console.warn("Clerk OAuth redirect error, attempting popup modal:", err);
      }

      // Popup fallback
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

    setErrorMessage("Could not initialize Google authentication. Please try email login.");
    setIsLoading(false);
    setLoadingType(null);
  };

  // 2. Apple OAuth
  const handleAppleSignIn = async () => {
    setErrorMessage("");
    setIsLoading(true);
    setLoadingType("apple");

    if (isClerkConfigured && clerk) {
      try {
        if (clerk.client) {
          const redirectUrl = `${window.location.origin}/sso-callback`;
          const primaryAuth = authModalMode === "sign-up" ? clerk.client.signUp : clerk.client.signIn;
          await primaryAuth.authenticateWithRedirect({
            strategy: "oauth_apple",
            redirectUrl,
            redirectUrlComplete: "/",
            continueSignUp: true,
            continueSignIn: true,
          });
          return;
        }
      } catch (err: unknown) {
        console.warn("Clerk Apple OAuth error:", err);
      }

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

    setErrorMessage("Apple Sign-In is not configured yet. Please continue with Google or Email.");
    setIsLoading(false);
    setLoadingType(null);
  };

  // 3. Phone Sign-In
  const handlePhoneSignIn = async () => {
    if (isClerkConfigured && clerk) {
      handleClose();
      clerk.openSignIn({
        fallbackRedirectUrl: "/",
        signUpFallbackRedirectUrl: "/",
      });
    } else {
      setErrorMessage("Phone login requires Clerk connection. Please use Google or Email.");
    }
  };

  // 4. Email Sign-In
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

    // Direct fallback for local development
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      {/* ChatGPT-Style Sleek Dark Modal Card */}
      <div className="relative w-full max-w-[390px] sm:max-w-[400px] rounded-[28px] bg-[#18181b] border border-white/10 p-6 sm:p-7 shadow-[0_20px_50px_rgba(0,0,0,0.85)] text-white overflow-hidden">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer z-10"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Title & Subtitle */}
        <div className="text-center mb-6 pt-1">
          <h2 className="text-2xl sm:text-[26px] font-bold text-white tracking-tight font-space">
            Log in or sign up
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1.5 leading-relaxed font-sans max-w-[280px] mx-auto">
            You&apos;ll get smarter responses and can access real-time financial intelligence.
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300 flex items-center gap-2 animate-in fade-in">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
            <span className="truncate">{errorMessage}</span>
          </div>
        )}

        {/* Action Buttons (ChatGPT Style Rounded Pills) */}
        <div className="space-y-2.5">
          {/* 1. Continue with Google */}
          <button
            type="button"
            disabled={isLoading}
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-full bg-[#27272a] hover:bg-[#323238] border border-white/10 hover:border-white/20 text-white font-semibold text-sm transition-all cursor-pointer shadow-sm active:scale-[0.99] disabled:opacity-60"
          >
            {isLoading && loadingType === "google" ? (
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            ) : (
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
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
            <span>Continue with Google</span>
          </button>

          {/* 2. Continue with Apple */}
          <button
            type="button"
            disabled={isLoading}
            onClick={handleAppleSignIn}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-full bg-[#27272a] hover:bg-[#323238] border border-white/10 hover:border-white/20 text-white font-semibold text-sm transition-all cursor-pointer shadow-sm active:scale-[0.99] disabled:opacity-60"
          >
            {isLoading && loadingType === "apple" ? (
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            ) : (
              <svg className="w-4 h-4 shrink-0 fill-white" viewBox="0 0 24 24">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 0.92-2.87-.9.04-2 .6-2.65 1.36-.58.67-1.09 1.74-.95 2.78 1.01.08 2.05-.52 2.68-1.27z" />
              </svg>
            )}
            <span>Continue with Apple</span>
          </button>

          {/* 3. Continue with phone */}
          <button
            type="button"
            disabled={isLoading}
            onClick={handlePhoneSignIn}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-full bg-[#27272a] hover:bg-[#323238] border border-white/10 hover:border-white/20 text-white font-semibold text-sm transition-all cursor-pointer shadow-sm active:scale-[0.99] disabled:opacity-60"
          >
            {isLoading && loadingType === "phone" ? (
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            ) : (
              <Phone className="w-4 h-4 text-white shrink-0" />
            )}
            <span>Continue with phone</span>
          </button>
        </div>

        {/* Divider: OR */}
        <div className="relative flex items-center justify-center my-4">
          <div className="border-t border-white/10 w-full" />
          <span className="bg-[#18181b] px-3 text-[11px] text-slate-400 font-bold uppercase tracking-wider font-mono">
            OR
          </span>
          <div className="border-t border-white/10 w-full" />
        </div>

        {/* Email Form */}
        <form onSubmit={handleEmailSignIn} className="space-y-3">
          <input
            type="email"
            required
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            placeholder="Email address"
            className="w-full py-3 px-4 rounded-full bg-[#27272a] border border-white/10 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 transition-all font-sans"
          />

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-full bg-white hover:bg-slate-200 text-black font-semibold text-sm transition-all cursor-pointer shadow-md active:scale-[0.99] disabled:opacity-60 font-space flex items-center justify-center"
          >
            {isLoading && loadingType === "email" ? (
              <Loader2 className="w-4 h-4 animate-spin text-black" />
            ) : (
              <span>Continue</span>
            )}
          </button>
        </form>

        {/* Footer */}
        <p className="text-[11px] text-slate-500 text-center mt-5 leading-relaxed font-sans">
          By continuing, you agree to our Terms &amp; Privacy Policy.
        </p>
      </div>
    </div>
  );
}
