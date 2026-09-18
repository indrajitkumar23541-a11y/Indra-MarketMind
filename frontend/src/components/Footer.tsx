"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Smartphone,
  Laptop,
  Apple,
  ExternalLink,
  ShieldCheck,
  Zap,
  Activity,
  Sparkles,
  ArrowUpRight,
  TrendingUp,
  LineChart,
  Brain,
  Globe2,
  Rss,
  Star,
  Bell,
  Lock,
} from "lucide-react";
import UniversalAppDownloadModal from "./UniversalAppDownloadModal";

export default function Footer() {
  const [downloadModalOpen, setDownloadModalOpen] = useState(false);

  return (
    <>
      <footer className="mt-14 sm:mt-20 border-t border-cyan-500/15 bg-[#060913]/90 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 md:p-10 text-slate-300 relative overflow-hidden shadow-[0_-15px_40px_rgba(0,0,0,0.8)]">
        {/* Glowing Top Ambient Accent */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-24 bg-cyan-500/10 blur-3xl pointer-events-none rounded-full" />

        {/* Main Grid: 4 Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10 pb-10 border-b border-white/10">
          
          {/* Column 1: Brand & Infrastructure Status (4 cols on lg) */}
          <div className="lg:col-span-4 space-y-4">
            <Link href="/" className="inline-flex items-center gap-2.5 group">
              <img
                src="/logo.png"
                alt="Indra-MarketMind Logo"
                className="w-8 h-8 rounded-xl object-cover border border-[#00F0FF]/40 shadow-[0_0_15px_rgba(0,240,255,0.3)] group-hover:scale-105 transition-transform"
              />
              <div className="font-space font-bold text-lg text-white tracking-tight">
                Indra-<span className="text-[#00F0FF]">MarketMind</span>
              </div>
            </Link>

            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Institutional-grade artificial intelligence financial terminal decoding real-time market sentiment, 5-model NLP ensembling, Monte Carlo predictive fan cones, and live global exchange telemetry.
            </p>

            {/* Live Operational Status Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="font-mono text-[11px] tracking-wide">ALL SYSTEMS OPERATIONAL</span>
            </div>

            {/* Architect Attribution */}
            <div className="text-xs text-slate-400 pt-1">
              Architected &amp; Engineered by{" "}
              <a
                href="https://github.com/indrajitkumar23541-a11y"
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-cyan-300 hover:text-cyan-200 underline decoration-cyan-500/50 inline-flex items-center gap-1 transition-colors"
              >
                Indrajit Kumar
                <ArrowUpRight className="w-3 h-3 inline" />
              </a>
            </div>
          </div>

          {/* Column 2: Platform & AI Models (3 cols on lg) */}
          <div className="lg:col-span-3 space-y-3">
            <div className="font-space font-bold text-xs uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Platform &amp; AI Tools</span>
            </div>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/" className="text-slate-400 hover:text-white transition-colors flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5 text-cyan-400/80" />
                  <span>Terminal Dashboard</span>
                </Link>
              </li>
              <li>
                <Link href="/forecast" className="text-slate-400 hover:text-white transition-colors flex items-center gap-2">
                  <LineChart className="w-3.5 h-3.5 text-cyan-400/80" />
                  <span>Hybrid ML Price Forecast</span>
                </Link>
              </li>
              <li>
                <Link href="/screener" className="text-slate-400 hover:text-white transition-colors flex items-center gap-2">
                  <TrendingUp className="w-3.5 h-3.5 text-cyan-400/80" />
                  <span>Institutional Stock Screener</span>
                </Link>
              </li>
              <li>
                <Link href="/live-feed" className="text-slate-400 hover:text-white transition-colors flex items-center gap-2">
                  <Rss className="w-3.5 h-3.5 text-cyan-400/80" />
                  <span>Real-Time Sentiment Live Feed</span>
                </Link>
              </li>
              <li>
                <Link href="/fear-greed" className="text-slate-400 hover:text-white transition-colors flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5 text-cyan-400/80" />
                  <span>7-Factor Fear &amp; Greed Radar</span>
                </Link>
              </li>
              <li>
                <Link href="/research" className="text-slate-400 hover:text-white transition-colors flex items-center gap-2">
                  <Brain className="w-3.5 h-3.5 text-cyan-400/80" />
                  <span>AI Quant Lab &amp; Backtester</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Market Analytics & Telemetry (3 cols on lg) */}
          <div className="lg:col-span-3 space-y-3">
            <div className="font-space font-bold text-xs uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
              <Globe2 className="w-3.5 h-3.5" />
              <span>Intelligence &amp; Markets</span>
            </div>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/deep-dive" className="text-slate-400 hover:text-white transition-colors flex items-center gap-2">
                  <span>Equity Deep Dive Valuation</span>
                </Link>
              </li>
              <li>
                <Link href="/global-map" className="text-slate-400 hover:text-white transition-colors flex items-center gap-2">
                  <span>19 Global Financial Exchanges</span>
                </Link>
              </li>
              <li>
                <Link href="/sector" className="text-slate-400 hover:text-white transition-colors flex items-center gap-2">
                  <span>Sector Rotation Matrix</span>
                </Link>
              </li>
              <li>
                <Link href="/insider" className="text-slate-400 hover:text-white transition-colors flex items-center gap-2">
                  <span>Insider Trading &amp; Whale Buys</span>
                </Link>
              </li>
              <li>
                <Link href="/watchlist" className="text-slate-400 hover:text-white transition-colors flex items-center gap-2">
                  <Star className="w-3.5 h-3.5 text-amber-400/80" />
                  <span>Institutional Watchlist</span>
                </Link>
              </li>
              <li>
                <Link href="/alerts" className="text-slate-400 hover:text-white transition-colors flex items-center gap-2">
                  <Bell className="w-3.5 h-3.5 text-cyan-400/80" />
                  <span>Real-Time Alert Dispatcher</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Universal Multi-Platform & App (2 cols on lg) */}
          <div className="lg:col-span-2 space-y-3">
            <div className="font-space font-bold text-xs uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5" />
              <span>Multi-Platform</span>
            </div>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => setDownloadModalOpen(true)}
                  className="text-slate-400 hover:text-cyan-300 transition-colors flex items-center gap-2 text-left cursor-pointer"
                >
                  <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Android APK App</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setDownloadModalOpen(true)}
                  className="text-slate-400 hover:text-cyan-300 transition-colors flex items-center gap-2 text-left cursor-pointer"
                >
                  <Laptop className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Desktop PC Software</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setDownloadModalOpen(true)}
                  className="text-slate-400 hover:text-cyan-300 transition-colors flex items-center gap-2 text-left cursor-pointer"
                >
                  <Apple className="w-3.5 h-3.5 text-slate-300" />
                  <span>Apple iOS Standalone</span>
                </button>
              </li>
              <li>
                <Link href="/settings" className="text-slate-400 hover:text-white transition-colors flex items-center gap-2">
                  <span>Terminal Settings</span>
                </Link>
              </li>
              <li>
                <Link href="/support" className="text-slate-400 hover:text-white transition-colors flex items-center gap-2">
                  <span>Support &amp; Feedback</span>
                </Link>
              </li>
              <li>
                <a
                  href="https://github.com/indrajitkumar23541-a11y/Indra-MarketMind"
                  target="_blank"
                  rel="noreferrer"
                  className="text-slate-400 hover:text-cyan-300 transition-colors flex items-center gap-1.5"
                >
                  <span>GitHub Repository</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Regulatory Financial Risk Disclaimer */}
        <div className="py-6 border-b border-white/10 text-[11px] text-slate-400 leading-relaxed space-y-2">
          <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-slate-300 font-mono text-[10px]">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>Regulatory &amp; Market Risk Disclaimer</span>
          </div>
          <p>
            Indra-MarketMind is an advanced artificial intelligence and quantitative financial research terminal. Market data, sentiment scoring, and algorithmic forecasts are compiled for informational and decision-support purposes only and do not constitute certified financial, investment, legal, or tax advice. Trading equities, futures, options, commodities, and digital currencies involves substantial risk of loss. Always conduct independent research or consult a licensed SEBI/SEC financial advisor before placing trades.
          </p>
        </div>

        {/* Bottom Bar: Copyright & Security Badges */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="text-center sm:text-left">
            &copy; {new Date().getFullYear()}{" "}
            <span className="font-space font-bold text-white">Indra-MarketMind</span>. Engineered with pride by{" "}
            <span className="text-cyan-300 font-semibold">Indrajit Kumar</span>. All rights reserved.
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-4 text-[11px] font-mono">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-300">
              <Lock className="w-3 h-3 text-cyan-400" />
              <span>256-Bit SSL</span>
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-300">
              <Zap className="w-3 h-3 text-emerald-400" />
              <span>Edge Turbopack</span>
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-300">
              <Brain className="w-3 h-3 text-purple-400" />
              <span>FinBERT NLP</span>
            </span>
          </div>
        </div>
      </footer>

      {/* Universal Download Hub Modal */}
      <UniversalAppDownloadModal
        isOpen={downloadModalOpen}
        onClose={() => setDownloadModalOpen(false)}
      />
    </>
  );
}
