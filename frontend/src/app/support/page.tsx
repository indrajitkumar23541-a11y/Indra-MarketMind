import type { Metadata } from "next";
import Link from "next/link";
import {
  HelpCircle,
  ExternalLink,
  BookOpen,
  Cpu,
  Shield,
  Zap,
  CheckCircle2,
  Terminal,
  Activity,
  ArrowRight,
  Brain,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Institutional Documentation & Support | Indra-MarketMind",
  description:
    "Explore quantitative finance whitepapers, 5-model NLP ensemble architecture, and hedge fund terminal documentation.",
};

const FAQS = [
  {
    q: "How does the 5-Model NLP Sentiment Ensemble operate?",
    a: "Indra-MarketMind processes news headlines and social feeds through FinBERT (35%), RoBERTa (25%), FinGPT (20%), VADER (10%), and TextBlob (10%). The scores are weighted and calibrated against historical volatility to generate normalized sentiment scores between -1.0 (Extreme Bearish) and +1.0 (Extreme Bullish).",
  },
  {
    q: "What methodology is used for price forecasting?",
    a: "We combine Facebook Prophet for macroeconomic seasonality/regime shifts with a bidirectional deep LSTM network for short-term momentum. The output produces confidence intervals with Monte Carlo fan cones for 7 to 90 days.",
  },
  {
    q: "Where is market data sourced from?",
    a: "Real-time quotes, sector indexes, and benchmark feeds are ingested via multi-provider failover bridges including Yahoo Finance, Finnhub, NSE/BSE institutional webhooks, and SEC EDGAR filings.",
  },
  {
    q: "Are my custom API keys stored securely?",
    a: "Yes. All custom API keys entered in the Settings Vault are isolated in your browser's local sandbox storage using AES-256 client isolation and are never stored on unauthenticated servers.",
  },
];

export default function SupportPage() {
  return (
    <div className="max-w-6xl mx-auto w-full space-y-6 pb-12 px-2 sm:px-4 md:px-6">
      {/* Header Panel */}
      <div className="glass-panel p-6 sm:p-8 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-indigo-600/10 to-transparent pointer-events-none" />
        <div className="relative z-10 flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-400 via-indigo-500 to-purple-600 flex items-center justify-center text-black font-bold shadow-[0_0_20px_rgba(0,240,255,0.4)] shrink-0">
            <HelpCircle className="w-6 h-6 text-black" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-manrope font-bold text-white tracking-tight">
              Institutional Documentation & Support
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-0.5 leading-relaxed">
              Explore mathematical specifications, causality test documentation, and system architecture.
            </p>
          </div>
        </div>

        <div className="relative z-10">
          <a
            href="https://github.com/indrajitkumar23541-a11y/Indra-MarketMind"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-space font-bold text-xs shadow-md transition-all cursor-pointer border border-white/10"
          >
            <span>GitHub Repository</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* 3 Core Architecture Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-panel p-5 space-y-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20">
            <Brain className="w-5 h-5" />
          </div>
          <h3 className="font-space font-bold text-base text-white">5-Model NLP Ensemble</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Multi-layered neural network sentiment extraction combining financial FinBERT, contextual RoBERTa, and generative FinGPT.
          </p>
        </div>

        <div className="glass-panel p-5 space-y-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
            <Activity className="w-5 h-5" />
          </div>
          <h3 className="font-space font-bold text-base text-white">Hybrid Price Forecaster</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Dual-engine quantitative architecture pairing macro structural Prophet curves with recurrent LSTM neural networks.
          </p>
        </div>

        <div className="glass-panel p-5 space-y-3">
          <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20">
            <Shield className="w-5 h-5" />
          </div>
          <h3 className="font-space font-bold text-base text-white">7-Factor Fear & Greed</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Real-time composite sentiment gauging volatility regimes, put/call ratios, stock price breadth, and safe haven flows.
          </p>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="glass-panel p-6 space-y-4">
        <h3 className="font-space font-bold text-lg text-white mb-2">
          Frequently Asked Questions (FAQ)
        </h3>
        <div className="space-y-3">
          {FAQS.map((faq, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-[#090F1E] border border-white/5 space-y-1.5">
              <div className="text-sm font-semibold text-cyan-300 font-space flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                {faq.q}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed pl-6">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
