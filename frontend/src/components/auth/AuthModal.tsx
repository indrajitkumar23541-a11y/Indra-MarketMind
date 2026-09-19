"use client";

import React, { useState, useRef, useEffect } from "react";
import { useMarketMindAuth } from "@/lib/AuthContext";
import { useClerk } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import {
  X,
  Sparkles,
  ShieldCheck,
  Loader2,
  Phone,
  Mail,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  CheckCircle2,
} from "lucide-react";

type AuthMethod = "phone" | "email";
type Step = "input" | "otp";
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
  } = useMarketMindAuth();

  // Selected Tab: Phone or Email
  const [authMethod, setAuthMethod] = useState<AuthMethod>("phone");

  // Flow Step: Input phone/email OR Enter OTP
  const [step, setStep] = useState<Step>("input");

  // Form Inputs
  const [countryCode, setCountryCode] = useState("+91");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [otpCode, setOtpCode] = useState(["", "", "", "", "", ""]);

  // Status & Error states
  const [isLoading, setIsLoading] = useState(false);
  const [loadingType, setLoadingType] = useState<"google" | "send_otp" | "verify" | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [resendCountdown, setResendCountdown] = useState(0);

  // Reference for active OTP input focus
  const otpRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  // Reset modal state cleanly upon closing
  const handleCloseModal = () => {
    setStep("input");
    setOtpCode(["", "", "", "", "", ""]);
    setErrorMessage("");
    setIsLoading(false);
    setLoadingType(null);
    closeAuthModal();
  };

  // Countdown timer for Resend OTP
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  // 1. Google 1-Click Instant Login (ChatGPT Style)
  const handleGoogleLogin = async () => {
    setErrorMessage("");
    setIsLoading(true);
    setLoadingType("google");

    try {
      if (isClerkConfigured && clerk) {
        handleCloseModal();
        clerk.openSignIn({
          appearance: {
            theme: dark,
            variables: {
              colorPrimary: "#00F0FF",
            },
          },
        });
        return;
      } else {
        // Resilient fallback simulation
        setTimeout(() => {
          simulateLogin("trader.google@marketmind.ai", "Indrajit Kumar (Google)");
          setIsLoading(false);
          handleCloseModal();
        }, 500);
      }
    } catch (err: unknown) {
      console.warn("Google sign in error:", err);
      // Fallback to direct redirect if modal is blocked
      try {
        if (clerk?.client) {
          await clerk.client.signIn.authenticateWithRedirect({
            strategy: "oauth_google",
            redirectUrl: "/sso-callback",
            redirectUrlComplete: "/",
          });
          return;
        }
      } catch (redirectErr: unknown) {
        const errObj = redirectErr as ClerkErrorLike;
        setErrorMessage(
          errObj?.errors?.[0]?.longMessage ||
          errObj?.errors?.[0]?.message ||
          "Google login could not be initiated. Please try with Phone or Email."
        );
      }
      setIsLoading(false);
      setLoadingType(null);
    }
  };

  // 2. Send OTP (Phone SMS or Email Code)
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage("");

    if (authMethod === "phone") {
      const cleanPhone = phoneNumber.replace(/\D/g, "");
      if (cleanPhone.length < 10) {
        setErrorMessage("Please enter a valid 10-digit mobile number.");
        return;
      }
    } else {
      const cleanEmail = emailAddress.trim();
      if (!cleanEmail || !cleanEmail.includes("@")) {
        setErrorMessage("Please enter a valid email address.");
        return;
      }
    }

    setIsLoading(true);
    setLoadingType("send_otp");

    const fullPhone = `${countryCode}${phoneNumber.replace(/\D/g, "")}`;
    const cleanEmail = emailAddress.trim();

    try {
      if (isClerkConfigured && clerk?.client) {
        if (authMethod === "phone") {
          // Attempt Sign-in with Phone first
          try {
            const signInAttempt = await clerk.client.signIn.create({
              identifier: fullPhone,
            });
            const firstFactor = signInAttempt.supportedFirstFactors?.find(
              (f: { strategy?: string }) => f.strategy === "phone_code"
            ) as { phoneNumberId?: string } | undefined;
            if (firstFactor?.phoneNumberId) {
              await clerk.client.signIn.prepareFirstFactor({
                strategy: "phone_code",
                phoneNumberId: firstFactor.phoneNumberId,
              });
            }
          } catch {
            // If user doesn't exist yet, automatically initiate Sign-Up
            await clerk.client.signUp.create({
              phoneNumber: fullPhone,
            });
            await clerk.client.signUp.preparePhoneNumberVerification({
              strategy: "phone_code",
            });
          }
        } else {
          // Attempt Sign-in with Email OTP
          try {
            const signInAttempt = await clerk.client.signIn.create({
              identifier: cleanEmail,
            });
            const firstFactor = signInAttempt.supportedFirstFactors?.find(
              (f: { strategy?: string }) => f.strategy === "email_code"
            ) as { emailAddressId?: string } | undefined;
            if (firstFactor?.emailAddressId) {
              await clerk.client.signIn.prepareFirstFactor({
                strategy: "email_code",
                emailAddressId: firstFactor.emailAddressId,
              });
            }
          } catch {
            // If user doesn't exist yet, automatically initiate Sign-Up
            await clerk.client.signUp.create({
              emailAddress: cleanEmail,
            });
            await clerk.client.signUp.prepareEmailAddressVerification({
              strategy: "email_code",
            });
          }
        }

        // Successfully initiated OTP
        setStep("otp");
        setResendCountdown(30);
        setTimeout(() => otpRefs[0].current?.focus(), 100);
      } else {
        // Fallback simulation mode
        setTimeout(() => {
          setStep("otp");
          setResendCountdown(30);
          setTimeout(() => otpRefs[0].current?.focus(), 100);
        }, 400);
      }
    } catch (err: unknown) {
      console.error("Send OTP error:", err);
      const errObj = err as ClerkErrorLike;
      const msg =
        errObj?.errors?.[0]?.longMessage ||
        errObj?.errors?.[0]?.message ||
        errObj?.message ||
        "Could not send verification code. Please check details.";
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
      setLoadingType(null);
    }
  };

  // 3. Verify OTP Code
  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage("");

    const code = otpCode.join("");
    if (code.length < 6) {
      setErrorMessage("Please enter all 6 digits of your verification code.");
      return;
    }

    setIsLoading(true);
    setLoadingType("verify");

    const cleanEmail = emailAddress.trim();

    try {
      if (isClerkConfigured && clerk?.client) {
        let activeSessionId: string | null = null;

        if (authMethod === "phone") {
          // Check if pending sign-in attempt
          if (clerk.client.signIn.status === "needs_first_factor") {
            const res = await clerk.client.signIn.attemptFirstFactor({
              strategy: "phone_code",
              code,
            });
            if (res.status === "complete") {
              activeSessionId = res.createdSessionId;
            }
          } else {
            // Pending sign-up attempt
            const res = await clerk.client.signUp.attemptPhoneNumberVerification({
              code,
            });
            if (res.status === "complete") {
              activeSessionId = res.createdSessionId;
            }
          }
        } else {
          // Email OTP verification
          if (clerk.client.signIn.status === "needs_first_factor") {
            const res = await clerk.client.signIn.attemptFirstFactor({
              strategy: "email_code",
              code,
            });
            if (res.status === "complete") {
              activeSessionId = res.createdSessionId;
            }
          } else {
            const res = await clerk.client.signUp.attemptEmailAddressVerification({
              code,
            });
            if (res.status === "complete") {
              activeSessionId = res.createdSessionId;
            }
          }
        }

        if (activeSessionId) {
          await clerk.setActive({ session: activeSessionId });
          handleCloseModal();
        } else {
          setErrorMessage("Verification could not be completed. Please try again.");
        }
      } else {
        // Fallback simulation session
        setTimeout(() => {
          if (authMethod === "phone") {
            simulateLogin(
              `user_${phoneNumber.slice(-4)}@phone.marketmind.ai`,
              `Trader (${countryCode} ${phoneNumber.slice(-4)})`
            );
          } else {
            simulateLogin(cleanEmail, cleanEmail.split("@")[0]);
          }
          handleCloseModal();
        }, 500);
      }
    } catch (err: unknown) {
      console.error("Verify OTP error:", err);
      const errObj = err as ClerkErrorLike;
      const msg =
        errObj?.errors?.[0]?.longMessage ||
        errObj?.errors?.[0]?.message ||
        errObj?.message ||
        "Invalid OTP code. Please check your messages and try again.";
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
      setLoadingType(null);
    }
  };

  // Handle single-box OTP input & auto-tabbing
  const handleOtpBoxChange = (index: number, val: string) => {
    const cleanVal = val.replace(/\D/g, "");
    if (!cleanVal) {
      const newOtp = [...otpCode];
      newOtp[index] = "";
      setOtpCode(newOtp);
      return;
    }

    // Support multi-character paste into first box
    if (cleanVal.length > 1) {
      const pastedDigits = cleanVal.slice(0, 6).split("");
      const newOtp = [...otpCode];
      pastedDigits.forEach((d, i) => {
        if (i < 6) newOtp[i] = d;
      });
      setOtpCode(newOtp);
      const nextIndex = Math.min(pastedDigits.length, 5);
      otpRefs[nextIndex].current?.focus();
      return;
    }

    const newOtp = [...otpCode];
    newOtp[index] = cleanVal[cleanVal.length - 1];
    setOtpCode(newOtp);

    // Auto-advance to next box
    if (index < 5 && cleanVal) {
      otpRefs[index + 1].current?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpCode[index] && index > 0) {
      otpRefs[index - 1].current?.focus();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      {/* Interactive Modal Card */}
      <div className="relative w-full max-w-[430px] rounded-3xl bg-[#0B0F19] border border-cyan-500/20 p-6 sm:p-7 shadow-[0_25px_60px_rgba(0,0,0,0.95)] text-white overflow-hidden">
        {/* Glowing Top Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-indigo-500 to-cyan-400" />

        {/* Close Button */}
        <button
          onClick={handleCloseModal}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer z-10"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* ================= STEP 1: INITIAL LOGIN / SIGNUP ================= */}
        {step === "input" && (
          <div>
            {/* Brand Header */}
            <div className="text-center mb-5">
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-400 to-indigo-600 flex items-center justify-center text-black font-bold shadow-[0_0_15px_rgba(0,240,255,0.4)]">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="font-space font-bold text-base text-white tracking-tight">
                  Indra-<span className="text-cyan-400">MarketMind</span>
                </div>
              </div>

              <h2 className="text-xl font-bold text-white font-sans tracking-tight">
                Welcome back
              </h2>
              <p className="text-xs text-slate-400 mt-0.5 font-sans">
                Sign in or register to sync your real-time portfolio & alerts.
              </p>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="mb-4 p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300 flex items-center gap-2 animate-in fade-in">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                <span className="line-clamp-2">{errorMessage}</span>
              </div>
            )}

            {/* 1. Google 1-Click Instant Login (ChatGPT Style) */}
            <button
              type="button"
              disabled={isLoading}
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-2xl bg-white/[0.08] hover:bg-white/[0.14] border border-white/15 hover:border-cyan-400/40 text-sm font-semibold text-white transition-all cursor-pointer shadow-[0_4px_20px_rgba(0,0,0,0.4)] active:scale-[0.98] disabled:opacity-50 group"
            >
              {isLoading && loadingType === "google" ? (
                <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
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
              <span className="font-sans">Continue with Google</span>
            </button>

            {/* Divider */}
            <div className="relative flex items-center justify-center my-4">
              <div className="border-t border-white/10 w-full" />
              <span className="bg-[#0B0F19] px-3 text-[11px] text-slate-400 uppercase tracking-wider font-mono">
                or continue with
              </span>
              <div className="border-t border-white/10 w-full" />
            </div>

            {/* Method Tabs: Phone vs Email */}
            <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-black/40 border border-white/10 mb-4">
              <button
                type="button"
                onClick={() => {
                  setAuthMethod("phone");
                  setErrorMessage("");
                }}
                className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  authMethod === "phone"
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Phone Number</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAuthMethod("email");
                  setErrorMessage("");
                }}
                className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  authMethod === "email"
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Email Address</span>
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSendOtp} className="space-y-4">
              {authMethod === "phone" ? (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Mobile Number
                  </label>
                  <div className="flex gap-2">
                    {/* Country Code Select */}
                    <div className="w-24 shrink-0">
                      <select
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value)}
                        className="w-full px-2.5 py-2.5 rounded-xl bg-black/50 border border-white/10 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-400 cursor-pointer"
                      >
                        <option value="+91">🇮🇳 +91</option>
                        <option value="+1">🇺🇸 +1</option>
                        <option value="+44">🇬🇧 +44</option>
                        <option value="+971">🇦🇪 +971</option>
                        <option value="+65">🇸🇬 +65</option>
                      </select>
                    </div>

                    {/* Phone Input */}
                    <input
                      type="tel"
                      required
                      autoFocus
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="98765 43210"
                      className="flex-1 px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/10 text-sm font-mono text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1.5">
                    We will send a 6-digit SMS OTP code to verify your phone.
                  </p>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    autoFocus
                    value={emailAddress}
                    onChange={(e) => setEmailAddress(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors font-sans"
                  />
                  <p className="text-[11px] text-slate-500 mt-1.5">
                    We will send a 6-digit verification code to your email inbox.
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-400 to-indigo-500 hover:from-cyan-300 hover:to-indigo-400 active:scale-95 text-black font-space font-bold text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-[0_0_20px_rgba(0,240,255,0.4)] disabled:opacity-50"
              >
                {isLoading && loadingType === "send_otp" ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sending Code...</span>
                  </>
                ) : (
                  <>
                    <span>
                      {authMethod === "phone" ? "Send SMS OTP" : "Send Email OTP"}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* ================= STEP 2: 6-DIGIT OTP VERIFICATION ================= */}
        {step === "otp" && (
          <div className="animate-in fade-in duration-200">
            {/* Header */}
            <div className="text-center mb-5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-400 to-indigo-600 flex items-center justify-center text-black font-bold mx-auto mb-3 shadow-[0_0_20px_rgba(0,240,255,0.4)]">
                {authMethod === "phone" ? (
                  <Phone className="w-5 h-5" />
                ) : (
                  <Mail className="w-5 h-5" />
                )}
              </div>
              <h2 className="text-lg font-bold font-space tracking-tight text-white">
                Enter Verification Code
              </h2>
              <p className="text-xs text-slate-400 mt-1 font-sans">
                We sent a 6-digit code to{" "}
                <span className="text-cyan-300 font-semibold font-mono">
                  {authMethod === "phone"
                    ? `${countryCode} ${phoneNumber}`
                    : emailAddress}
                </span>
              </p>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="mb-4 p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                <span className="line-clamp-2">{errorMessage}</span>
              </div>
            )}

            {/* 6 Digit Input Boxes */}
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div className="flex justify-between gap-1.5 sm:gap-2">
                {otpCode.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={otpRefs[idx]}
                    type="text"
                    inputMode="numeric"
                    maxLength={idx === 0 ? 6 : 1}
                    value={digit}
                    onChange={(e) => handleOtpBoxChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    className="w-11 h-12 sm:w-12 sm:h-13 rounded-xl bg-black/60 border border-white/15 focus:border-cyan-400 text-center font-mono text-lg font-bold text-cyan-300 focus:outline-none shadow-sm transition-all focus:ring-2 focus:ring-cyan-400/20"
                  />
                ))}
              </div>

              {/* Verify Button */}
              <button
                type="submit"
                disabled={isLoading || otpCode.join("").length < 6}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-400 to-indigo-500 hover:from-cyan-300 hover:to-indigo-400 active:scale-95 text-black font-space font-bold text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-[0_0_20px_rgba(0,240,255,0.4)] disabled:opacity-50"
              >
                {isLoading && loadingType === "verify" ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying Session...</span>
                  </>
                ) : (
                  <>
                    <span>Verify & Continue</span>
                    <CheckCircle2 className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Actions: Back or Resend */}
              <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setStep("input");
                    setErrorMessage("");
                  }}
                  className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Change {authMethod === "phone" ? "Number" : "Email"}</span>
                </button>

                {resendCountdown > 0 ? (
                  <span className="text-slate-500 font-mono text-[11px]">
                    Resend in {resendCountdown}s
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSendOtp()}
                    className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-semibold cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Resend Code</span>
                  </button>
                )}
              </div>
            </form>
          </div>
        )}

        {/* Clean Security Footer (Zero Third-Party Watermark) */}
        <div className="mt-5 pt-3.5 border-t border-white/5 flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>End-to-End Encrypted Session</span>
        </div>
      </div>
    </div>
  );
}
