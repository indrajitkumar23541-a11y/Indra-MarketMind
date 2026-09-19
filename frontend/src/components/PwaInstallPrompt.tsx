"use client";

import React, { useState, useEffect } from "react";
import { Download, X, Smartphone, Sparkles, Check } from "lucide-react";
import { useAppStatus } from "@/lib/useAppStatus";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export default function PwaInstallPrompt() {
  const { markAppAsDownloaded } = useAppStatus();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          reg.update();
          console.log("Indra-MarketMind Service Worker v7 active:", reg.scope);
        })
        .catch((err) => {
          console.error("Service Worker registration failed:", err);
        });
    }

    // 2. Check if already running in standalone (installed) mode
    if (typeof window !== "undefined") {
      const isStandalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone === true;

      if (isStandalone) {
        setIsInstalled(true);
        return;
      }

      // Check if iOS device
      const userAgent = window.navigator.userAgent.toLowerCase();
      const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
      setIsIos(isIosDevice);

      // Check if user dismissed recently
      const dismissedTime = localStorage.getItem("indra_pwa_dismissed");
      if (dismissedTime && Date.now() - parseInt(dismissedTime, 10) < 86400000) {
        setIsDismissed(true);
      }
    }

    // 3. Listen for Android/Desktop beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
      markAppAsDownloaded();
      console.log("Indra-MarketMind App successfully installed!");
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, [markAppAsDownloaded]);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setIsInstalled(true);
        setIsInstallable(false);
        markAppAsDownloaded();
      }
      setDeferredPrompt(null);
    } else if (isIos) {
      setShowIosGuide(true);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    if (typeof window !== "undefined") {
      localStorage.setItem("indra_pwa_dismissed", Date.now().toString());
    }
  };

  // Don't show if already running inside installed app or user dismissed
  if (isInstalled || isDismissed) {
    return null;
  }

  // Show if install prompt is ready or if on iOS (not installed)
  if (!isInstallable && !isIos) {
    return null;
  }

  return (
    <>
      {/* Floating App Install Banner */}
      <div className="fixed top-18 sm:top-20 right-3 sm:right-6 z-40 max-w-sm w-[calc(100vw-1.5rem)] animate-in fade-in slide-in-from-top-4 duration-300">
        <div className="p-3.5 rounded-2xl bg-[#090F1E]/95 border border-cyan-500/40 backdrop-blur-2xl shadow-[0_10px_35px_rgba(0,0,0,0.9)] flex items-center justify-between gap-3">
          {/* App Icon & Details */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl overflow-hidden border border-cyan-400/40 shadow-[0_0_15px_rgba(0,240,255,0.4)] shrink-0 bg-black">
              <img src="/logo.png" alt="App Logo" className="w-full h-full object-cover" />
            </div>
            <div className="min-w-0">
              <div className="font-space font-bold text-xs sm:text-sm text-white truncate flex items-center gap-1.5">
                Install MarketMind
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono">
                  App
                </span>
              </div>
              <div className="text-[10px] text-slate-400 truncate mt-0.5">
                Fast home-screen access & full-screen AI
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleInstallClick}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-400 to-indigo-500 hover:from-cyan-300 hover:to-indigo-400 text-black font-space font-bold text-xs shadow-[0_0_12px_rgba(0,240,255,0.5)] active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Install</span>
            </button>
            <button
              onClick={handleDismiss}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
              title="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* iOS Safari Guide Modal if tapped on iPhone/iPad */}
      {showIosGuide && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-4">
          <div className="max-w-md w-full p-5 rounded-3xl bg-[#090F1E] border border-cyan-500/30 text-center shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mx-auto mb-3 text-cyan-400">
              <Smartphone className="w-6 h-6" />
            </div>
            <h3 className="font-space font-bold text-base text-white mb-2">
              Install on iPhone / iPad
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-4 text-left space-y-2">
              <span className="block">1. Tap the <strong>Share</strong> icon in Safari bottom bar (square with upward arrow).</span>
              <span className="block">2. Scroll down and tap <strong>"Add to Home Screen"</strong> (➕).</span>
              <span className="block">3. Tap <strong>"Add"</strong> in top right.</span>
            </p>
            <button
              onClick={() => setShowIosGuide(false)}
              className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-space font-bold text-xs cursor-pointer transition-colors"
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </>
  );
}
