"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Smartphone,
  Laptop,
  Download,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  Apple,
} from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export default function UniversalAppDownloadModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [activeTab, setActiveTab] = useState<"android" | "desktop" | "apple">("android");
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isDesktopInstallable, setIsDesktopInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(() => {
    if (typeof window !== "undefined") {
      return (
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone === true
      );
    }
    return false;
  });

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsDesktopInstallable(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsDesktopInstallable(false);
      setDeferredPrompt(null);
    };

    if (typeof window !== "undefined") {
      window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.addEventListener("appinstalled", handleAppInstalled);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
        window.removeEventListener("appinstalled", handleAppInstalled);
      }
    };
  }, []);

  if (!isOpen) return null;

  const handleDesktopInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    }
  };

  const APK_DOWNLOAD_URL =
    "https://github.com/indrajitkumar23541-a11y/Indra-MarketMind/releases/download/android-v1.0/Indra-MarketMind.apk";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg rounded-3xl bg-[#090E1A] border border-cyan-500/30 p-6 sm:p-7 shadow-[0_25px_60px_rgba(0,0,0,0.95)] text-white overflow-hidden">
        {/* Glowing Top Accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-indigo-500 to-cyan-400" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer z-10"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Universal Multi-Platform Hub
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-space text-white tracking-tight">
            Get Indra-<span className="text-[#00F0FF]">MarketMind</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1 font-sans">
            Use on Laptop, Android, iPhone, or direct in your browser. All devices stay 100% synchronized.
          </p>
        </div>

        {/* Platform Selection Tabs */}
        <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-black/40 border border-white/10 mb-6">
          <button
            onClick={() => setActiveTab("android")}
            className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "android"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Android APK</span>
          </button>

          <button
            onClick={() => setActiveTab("desktop")}
            className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "desktop"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Laptop className="w-4 h-4" />
            <span>Laptop / PC</span>
          </button>

          <button
            onClick={() => setActiveTab("apple")}
            className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "apple"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Apple className="w-4 h-4" />
            <span>Apple iOS / Mac</span>
          </button>
        </div>

        {/* Tab 1: Android Standalone APK */}
        {activeTab === "android" && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                  Official Android APK
                </span>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                  Zero Chrome Dependency
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Directly installable Android Package (`.apk`). Launches in its own independent window with full phone <strong>App Lock & Fingerprint security</strong> support.
              </p>
            </div>

            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>Opens direct as native app (no browser tabs, no URL bar).</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>Supports Phone Settings &gt; App Lock / Fingerprint.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>Real-time cloud sync with live quotes, AI Copilot &amp; alerts.</span>
              </div>
            </div>

            <a
              href={APK_DOWNLOAD_URL}
              download="Indra-MarketMind.apk"
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-400 to-indigo-500 hover:from-cyan-300 hover:to-indigo-400 text-black font-space font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,240,255,0.4)] active:scale-95 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Download Indra-MarketMind.apk</span>
            </a>

            <p className="text-[10px] text-center text-slate-500 font-mono">
              Direct release build • SHA-256 Verified • Package: com.indramarketmind.app
            </p>
          </div>
        )}

        {/* Tab 2: Laptop & Desktop Software */}
        {activeTab === "desktop" && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                  Windows &amp; macOS Desktop App
                </span>
                <span className="text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 px-2 py-0.5 rounded-full font-bold">
                  Dedicated Window
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Run Indra-MarketMind as a standalone desktop software on your laptop or PC with taskbar pinning and dedicated desktop icon.
              </p>
            </div>

            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>Runs in an isolated window without browser tabs or address bar.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>Instant keyboard shortcut access (Ctrl + / for Search).</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>Pin to Windows Taskbar or macOS Dock with 1 click.</span>
              </div>
            </div>

            {isInstalled ? (
              <div className="py-3 px-4 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold text-center flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Indra-MarketMind Desktop App is already installed!</span>
              </div>
            ) : isDesktopInstallable ? (
              <button
                onClick={handleDesktopInstall}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-400 to-indigo-500 hover:from-cyan-300 hover:to-indigo-400 text-black font-space font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,240,255,0.4)] active:scale-95 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Install as Desktop App Now</span>
              </button>
            ) : (
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300 space-y-1">
                <div className="font-semibold text-white">How to install on Laptop / Desktop:</div>
                <div>1. In your browser (Chrome/Edge), look at the right end of the address bar.</div>
                <div>2. Click the <strong>Install</strong> or <strong>App available (🖥️)</strong> icon.</div>
                <div>3. Click <strong>Install</strong> to add it to your Desktop and Taskbar.</div>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Apple iPhone, iPad & Mac */}
        {activeTab === "apple" && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                  Apple iOS &amp; iPadOS
                </span>
                <span className="text-[10px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 px-2 py-0.5 rounded-full font-bold">
                  Retina Standalone
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Add directly to your iPhone or iPad home screen for an immersive, edge-to-edge dark sci-fi terminal experience.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2.5 text-xs text-slate-300">
              <div className="font-semibold text-white">3 Simple Steps on Safari (iPhone / iPad):</div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center text-[10px] font-bold shrink-0">1</span>
                <span>Open <strong>indra-marketmind.vercel.app</strong> in Safari.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center text-[10px] font-bold shrink-0">2</span>
                <span>Tap the <strong>Share</strong> button (box with upward arrow at bottom).</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center text-[10px] font-bold shrink-0">3</span>
                <span>Scroll down and select <strong>&quot;Add to Home Screen&quot; (➕)</strong> and tap Add.</span>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 text-center">
              The icon will appear on your iPhone screen and run in full-screen standalone mode.
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-5 pt-3.5 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>End-to-End Encrypted Terminal</span>
          </div>
          <a
            href="https://github.com/indrajitkumar23541-a11y/Indra-MarketMind"
            target="_blank"
            rel="noreferrer"
            className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-mono"
          >
            <span>GitHub</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
}
