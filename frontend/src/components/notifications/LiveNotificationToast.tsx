"use client";

import React from "react";
import { useNotifications } from "@/lib/NotificationContext";
import { X, Sparkles, ArrowRight, TrendingUp, TrendingDown, Bell, ExternalLink } from "lucide-react";
import Link from "next/link";

export default function LiveNotificationToast() {
  const { activeToast, dismissToast, markAsRead } = useNotifications();

  if (!activeToast) return null;

  const isBull = activeToast.type === "bullish";
  const isBear = activeToast.type === "bearish";

  const borderColor = isBull
    ? "border-emerald-500/50 shadow-[0_10px_35px_rgba(16,185,129,0.25)]"
    : isBear
    ? "border-rose-500/50 shadow-[0_10px_35px_rgba(244,63,94,0.25)]"
    : "border-cyan-500/50 shadow-[0_10px_35px_rgba(0,240,255,0.25)]";

  const accentGradient = isBull
    ? "from-emerald-400 to-teal-500"
    : isBear
    ? "from-rose-400 to-red-500"
    : "from-cyan-400 to-indigo-500";

  return (
    <div className="fixed top-4 right-3 left-3 sm:left-auto sm:right-6 z-50 max-w-sm w-full animate-in slide-in-from-top-4 fade-in duration-300 pointer-events-auto">
      <div
        className={`relative rounded-2xl bg-[#0B1020]/95 backdrop-blur-2xl border ${borderColor} p-4 text-white overflow-hidden`}
      >
        {/* Animated Top Glow Bar */}
        <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${accentGradient}`} />

        {/* Header Badge & Close Button */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  isBull ? "bg-emerald-400" : isBear ? "bg-rose-400" : "bg-cyan-400"
                }`}
              />
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  isBull ? "bg-emerald-500" : isBear ? "bg-rose-500" : "bg-cyan-500"
                }`}
              />
            </span>
            <span className="font-space font-bold text-[10px] uppercase tracking-wider text-cyan-300">
              {activeToast.source ? activeToast.source.toUpperCase() : "LIVE MARKET ALERT"}
            </span>
            <span className="text-[10px] text-slate-500 font-mono">• Just now</span>
          </div>

          <button
            onClick={dismissToast}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Dismiss notification"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Content */}
        <Link
          href={activeToast.url || "/live-feed"}
          onClick={() => {
            markAsRead(activeToast.id);
            dismissToast();
          }}
          className="block group"
        >
          <h4 className="font-sans font-bold text-sm text-white group-hover:text-cyan-300 transition-colors line-clamp-2 leading-snug mb-1">
            {activeToast.title}
          </h4>
          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed font-sans mb-2">
            {activeToast.message}
          </p>

          <div className="flex items-center justify-between pt-1 border-t border-white/5 text-[11px] text-cyan-400 font-semibold group-hover:underline">
            <span>Tap to open live analysis</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </Link>

        {/* 6-Second Auto-Dismiss Progress Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/10">
          <div
            className={`h-full bg-gradient-to-r ${accentGradient} animate-[shrink_6.5s_linear_forwards]`}
            style={{
              animation: "shrink 6.5s linear forwards",
            }}
          />
        </div>
      </div>
    </div>
  );
}
