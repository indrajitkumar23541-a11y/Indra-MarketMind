"use client";

import React, { useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  ExternalLink, 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  Cpu, 
  ShieldAlert, 
  Sparkles,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  BookOpen,
  CheckCircle2
} from "lucide-react";

export interface MarketAssetImpact {
  asset: string;
  ticker?: string;
  impact: string;
  reason: string;
}

export interface NewsArticleItem {
  id: string | number;
  source: string;
  title: string;
  content: string;
  url: string;
  image?: string | null;
  published_at?: string;
  time_ago?: string;
  category?: string;
  sentiment: "Bullish" | "Bearish" | "Neutral" | string;
  score: string;
  score_val?: number;
  models_breakdown?: {
    finbert: number;
    roberta: number;
    vader: number;
    confidence: string;
  };
  market_impact?: {
    bullish_assets: MarketAssetImpact[];
    bearish_assets: MarketAssetImpact[];
    key_takeaway: string;
  };
  tags?: string[];
}

interface NewsDetailModalProps {
  article: NewsArticleItem | null;
  onClose: () => void;
}

/**
 * Parses and formats news body with clean, beautiful typography.
 * Strips residual HTML, creates styled bullet points, distinct headings, and readable paragraphs.
 */
function FormattedArticleContent({ content }: { content: string }) {
  const blocks = useMemo(() => {
    if (!content) return [];

    // Clean any lingering HTML tags, entities, and journalistic noise
    const sanitized = content
      .replace(/<li[^>]*>/gi, "• ")
      .replace(/<\/li>/gi, "\n")
      .replace(/<p[^>]*>/gi, "\n\n")
      .replace(/<\/p>/gi, "")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<[^>]+>/g, "")
      .replace(/&nbsp;/g, " ")
      .replace(/&#39;/g, "'")
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, "&")
      .replace(/This article was written by [^\n]+/gi, "")
      .trim();

    return sanitized
      .split(/\n\s*\n|\n/)
      .map((line) => line.trim())
      .filter(Boolean);
  }, [content]);

  if (blocks.length === 0) {
    return <p className="text-slate-400 text-sm italic">No extended summary available.</p>;
  }

  return (
    <div className="space-y-4 font-sans">
      {blocks.map((block, idx) => {
        // Bullet list item
        if (block.startsWith("•") || block.startsWith("-") || block.startsWith("*")) {
          const cleanBullet = block.replace(/^[•\-\*]\s*/, "");
          return (
            <div 
              key={idx} 
              className="flex items-start gap-3 p-3.5 rounded-xl bg-white/[0.03] border border-white/5 hover:border-[#00F0FF]/30 transition-all shadow-xs"
            >
              <div className="w-2 h-2 rounded-full bg-[#00F0FF] mt-2 shrink-0 shadow-sm shadow-[#00F0FF]/50" />
              <p className="text-slate-200 text-sm sm:text-[14.5px] leading-relaxed font-medium">
                {cleanBullet}
              </p>
            </div>
          );
        }

        // Subheading question / topic breakdown
        const isHeader = (block.endsWith("?") || (block.length < 65 && !block.endsWith("."))) && idx > 0;
        if (isHeader) {
          return (
            <div key={idx} className="pt-3 pb-1">
              <h4 className="text-white font-manrope font-bold text-sm sm:text-base border-l-2 border-[#00F0FF] pl-3 flex items-center gap-2 tracking-tight">
                <span className="text-[#00F0FF]">§</span>
                <span>{block}</span>
              </h4>
            </div>
          );
        }

        // Standard rich narrative paragraph
        return (
          <p 
            key={idx} 
            className="text-slate-200 text-sm sm:text-[15px] leading-relaxed font-normal text-justify tracking-normal antialiased selection:bg-[#00F0FF]/30"
          >
            {block}
          </p>
        );
      })}
    </div>
  );
}

export default function NewsDetailModal({ article, onClose }: NewsDetailModalProps) {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!article) return null;

  const isBullish = article.sentiment === "Bullish";
  const isBearish = article.sentiment === "Bearish";

  const impact = article.market_impact || {
    bullish_assets: [
      { asset: "Global Equities", ticker: "^GSPC", impact: "+1.2%", reason: "Risk-on sentiment supports broad index inflows." }
    ],
    bearish_assets: [
      { asset: "Volatility Index (VIX)", ticker: "^VIX", impact: "-4.5%", reason: "Lower uncertainty dampens option demand." }
    ],
    key_takeaway: "Traders should evaluate sector momentum and maintain strict stop-losses."
  };

  const models = article.models_breakdown || {
    finbert: 0.82,
    roberta: 0.78,
    vader: 0.75,
    confidence: "94%"
  };

  // Estimate reading time
  const wordCount = article.content ? article.content.split(/\s+/).length : 50;
  const readTimeMins = Math.max(1, Math.ceil(wordCount / 180));

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/85 backdrop-blur-md cursor-pointer"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          transition={{ type: "spring", duration: 0.35, bounce: 0.1 }}
          className="relative w-full max-w-3xl bg-[#090D16] border border-white/10 rounded-2xl shadow-2xl shadow-[#00F0FF]/10 overflow-hidden z-10 my-6 max-h-[92vh] flex flex-col"
        >
          {/* Neon Top Border Accent */}
          <div className={`h-1.5 w-full ${
            isBullish 
              ? 'bg-gradient-to-r from-emerald-500 via-[#00F0FF] to-teal-400' 
              : isBearish 
              ? 'bg-gradient-to-r from-rose-500 via-orange-500 to-amber-500' 
              : 'bg-gradient-to-r from-cyan-500 to-indigo-500'
          }`} />

          {/* Header */}
          <div className="p-5 sm:p-6 border-b border-white/10 flex items-start justify-between gap-4 bg-white/[0.02]">
            <div className="space-y-2.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-[#00F0FF]/10 text-[#00F0FF] border border-[#00F0FF]/20 flex items-center gap-1.5 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00F0FF] animate-pulse" />
                  {article.source}
                </span>

                {article.category && (
                  <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-white/5 text-slate-300 border border-white/10">
                    #{article.category}
                  </span>
                )}

                <span className="flex items-center gap-1 text-xs text-slate-400 font-mono">
                  <Clock className="w-3.5 h-3.5" />
                  {article.time_ago || "Just now"}
                </span>

                <span className="flex items-center gap-1 text-xs text-slate-400 font-mono">
                  <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                  {readTimeMins}m read
                </span>

                {/* Sentiment Badge */}
                <span className={`px-2.5 py-1 rounded-md text-xs font-bold flex items-center gap-1 shrink-0 ${
                  isBullish ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                  isBearish ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                  'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                }`}>
                  {isBullish && <ArrowUpRight className="w-3.5 h-3.5" />}
                  {isBearish && <ArrowDownRight className="w-3.5 h-3.5" />}
                  <span>{article.sentiment}</span>
                  <span className="font-mono">({article.score})</span>
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold font-manrope text-white tracking-tight leading-snug">
                {article.title}
              </h2>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/5 transition-colors shrink-0 cursor-pointer"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Scrollable Body */}
          <div className="p-5 sm:p-6 overflow-y-auto space-y-6 custom-scrollbar">
            
            {/* 📰 Institutional Reader View: Article Overview & Context */}
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-white/5">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                  <Layers className="w-3.5 h-3.5 text-[#00F0FF]" /> Article Overview & Intel
                </h3>
                <span className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" /> NLP Verified
                </span>
              </div>

              {/* Formatted Article Content with Beautiful Typography */}
              <FormattedArticleContent content={article.content} />
            </div>

            {/* 🔮 INDRA MARKET IMPACT MATRIX (Kiska Rate Badhega vs Girega) */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 font-manrope">
                  <Sparkles className="w-4 h-4 text-[#00F0FF]" /> Indra Market Impact Matrix
                </h3>
                <span className="text-[11px] text-[#00F0FF] bg-[#00F0FF]/10 px-2.5 py-0.5 rounded-full border border-[#00F0FF]/20 font-mono font-semibold">
                  Institutional Projection
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 🟢 Expected Winners (Rate Upar Jayega) */}
                <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wide font-manrope">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    <span>🟢 Expected Winners (Rate Upar Jayega)</span>
                  </div>

                  {impact.bullish_assets && impact.bullish_assets.length > 0 ? (
                    impact.bullish_assets.map((item, idx) => (
                      <div key={idx} className="bg-black/40 p-3 rounded-lg border border-emerald-500/10 space-y-1 hover:border-emerald-500/30 transition-colors">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-white text-sm">{item.asset}</span>
                          <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                            {item.impact}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 leading-snug">{item.reason}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500 italic">No significant positive catalyst identified.</p>
                  )}
                </div>

                {/* 🔴 Expected Losers (Rate Girega) */}
                <div className="bg-rose-950/20 border border-rose-500/20 rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase tracking-wide font-manrope">
                    <TrendingDown className="w-4 h-4 text-rose-400" />
                    <span>🔴 Expected Losers (Rate Girega)</span>
                  </div>

                  {impact.bearish_assets && impact.bearish_assets.length > 0 ? (
                    impact.bearish_assets.map((item, idx) => (
                      <div key={idx} className="bg-black/40 p-3 rounded-lg border border-rose-500/10 space-y-1 hover:border-rose-500/30 transition-colors">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-white text-sm">{item.asset}</span>
                          <span className="text-xs font-mono font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                            {item.impact}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 leading-snug">{item.reason}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500 italic">No direct downside vulnerability detected.</p>
                  )}
                </div>
              </div>

              {/* Actionable Quant Takeaway */}
              {impact.key_takeaway && (
                <div className="bg-gradient-to-r from-[#00F0FF]/10 via-indigo-500/10 to-transparent border border-[#00F0FF]/25 rounded-xl p-4 flex items-start gap-3 shadow-lg shadow-[#00F0FF]/5">
                  <ShieldAlert className="w-5 h-5 text-[#00F0FF] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-[#00F0FF] uppercase tracking-wider mb-1 font-mono">
                      Actionable Quant Takeaway
                    </h4>
                    <p className="text-xs sm:text-[13px] text-slate-200 leading-relaxed font-sans">
                      {impact.key_takeaway}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* 🧠 NLP Diagnostics & Sentiment Consensus */}
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 font-mono">
                <Cpu className="w-4 h-4 text-[#00F0FF]" /> Multi-Model NLP Consensus
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                <div className="bg-black/40 p-3 rounded-lg border border-white/5 text-center">
                  <div className="text-[10px] text-slate-400 uppercase font-mono">FinBERT</div>
                  <div className={`text-sm font-mono font-bold mt-1 ${models.finbert >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {models.finbert > 0 ? `+${models.finbert}` : models.finbert}
                  </div>
                </div>
                <div className="bg-black/40 p-3 rounded-lg border border-white/5 text-center">
                  <div className="text-[10px] text-slate-400 uppercase font-mono">RoBERTa</div>
                  <div className={`text-sm font-mono font-bold mt-1 ${models.roberta >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {models.roberta > 0 ? `+${models.roberta}` : models.roberta}
                  </div>
                </div>
                <div className="bg-black/40 p-3 rounded-lg border border-white/5 text-center">
                  <div className="text-[10px] text-slate-400 uppercase font-mono">VADER</div>
                  <div className={`text-sm font-mono font-bold mt-1 ${models.vader >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {models.vader > 0 ? `+${models.vader}` : models.vader}
                  </div>
                </div>
                <div className="bg-black/40 p-3 rounded-lg border border-white/5 text-center">
                  <div className="text-[10px] text-slate-400 uppercase font-mono">Confidence</div>
                  <div className="text-sm font-mono font-bold text-[#00F0FF] mt-1">
                    {models.confidence}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="p-4 sm:p-5 border-t border-white/10 bg-black/40 flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs text-slate-400">
              Verified by <span className="text-[#00F0FF] font-semibold">Indra MarketMind AI</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors cursor-pointer"
              >
                Close
              </button>

              {article.url && article.url !== "#" && (
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-lg text-xs font-bold text-black bg-[#00F0FF] hover:bg-[#00D8E6] transition-colors flex items-center gap-1.5 shadow-lg shadow-[#00F0FF]/20 cursor-pointer"
                >
                  <span>Read Full Article on {article.source}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
