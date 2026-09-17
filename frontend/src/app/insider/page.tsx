"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Key,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  Search,
  Filter,
  RefreshCw,
  ExternalLink,
  DollarSign,
  AlertTriangle,
  Briefcase,
  Layers,
  Sparkles,
} from "lucide-react";
import QuantumLoader from "@/components/QuantumLoader";

interface InsiderTransaction {
  id: string;
  ticker: string;
  company: string;
  exchange: "NSE" | "NASDAQ" | "NYSE";
  insiderName: string;
  position: string;
  type: "BUY" | "SELL" | "OPTION_EXERCISE" | "BLOCK_DEAL";
  shares: number;
  price: number;
  totalValue: number;
  valueFormatted: string;
  date: string;
  filingSource: "SEC Form 4" | "NSE Insider / Bulk" | "BSE Disclosures";
  sentiment: "BULLISH" | "BEARISH" | "NEUTRAL";
  notes: string;
}

interface WhaleAlert {
  ticker: string;
  insider: string;
  role: string;
  amountFormatted: string;
  type: "ACCUMULATION" | "LIQUIDATION";
  impact: "HIGH" | "CRITICAL";
  date: string;
  rationale: string;
}

interface InsiderPayload {
  summary: {
    totalTrackedTransactions: number;
    netSentiment: string;
    buyTransactions: number;
    sellTransactions: number;
    buyRatioPercent: number;
    whaleDealsCount: number;
    fiiCashFlowToday: string;
    diiCashFlowToday: string;
  };
  whaleAlerts: WhaleAlert[];
  transactions: InsiderTransaction[];
  lastUpdated: string;
}

export default function InsiderSignalsPage() {
  const [data, setData] = useState<InsiderPayload | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [exchangeFilter, setExchangeFilter] = useState<string>("ALL");

  const fetchInsiderData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/insider");
      if (!res.ok) throw new Error("Failed to load insider transactions");
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err.message || "Failed to load insider signals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsiderData();
  }, []);

  const filteredTransactions = useMemo(() => {
    if (!data?.transactions) return [];
    return data.transactions.filter((tx) => {
      // Search
      if (
        searchQuery &&
        !tx.ticker.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !tx.company.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !tx.insiderName.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }

      // Type filter
      if (typeFilter !== "ALL" && tx.type !== typeFilter) {
        return false;
      }

      // Exchange filter
      if (exchangeFilter !== "ALL" && tx.exchange !== exchangeFilter) {
        return false;
      }

      return true;
    });
  }, [data, searchQuery, typeFilter, exchangeFilter]);

  return (
    <div className="space-y-6 pb-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="glass-panel p-5 sm:p-7 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4 rounded-2xl border border-amber-500/20 bg-gradient-to-r from-amber-950/25 via-yellow-950/15 to-orange-950/20">
        <div className="absolute inset-0 bg-radial-[at_0%_0%] from-amber-500/10 to-transparent pointer-events-none"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.25)]">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-manrope font-bold text-white tracking-tight flex items-center gap-2">
                Smart Money & Insider Deals Radar
                <span className="text-[10px] bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full font-mono font-bold">
                  SEC FORM 4 + NSE BULK
                </span>
              </h1>
            </div>
          </div>
          <p className="text-slate-400 text-xs sm:text-sm max-w-2xl leading-relaxed">
            Real-time telemetry tracking legal insider trading, promoter acquisitions, CEO block purchases, and
            institutional foreign/domestic fund movements.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3 self-end md:self-auto">
          <button
            onClick={fetchInsiderData}
            disabled={loading}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-white/10 hover:border-amber-500/40 text-slate-300 hover:text-white text-xs font-semibold transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-amber-400" : ""}`} />
            Refresh Deals
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center">
          <QuantumLoader text="Scanning SEC EDGAR filings and NSE/BSE institutional block registries..." />
        </div>
      ) : error ? (
        <div className="glass-panel p-8 text-center rounded-2xl border border-red-500/30 text-red-400">
          <p className="font-bold">{error}</p>
          <button
            onClick={fetchInsiderData}
            className="mt-3 px-4 py-2 bg-red-500/20 text-red-300 rounded-xl text-xs font-bold"
          >
            Retry
          </button>
        </div>
      ) : (
        <>
          {/* Summary Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Net Sentiment Pulse */}
            <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-white/10 flex flex-col justify-between">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>INSIDER SENTIMENT</span>
                <Sparkles className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-manrope font-bold text-white mb-1">
                {data?.summary.netSentiment}
              </div>
              <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold">
                <TrendingUp className="w-3.5 h-3.5" />
                {data?.summary.buyRatioPercent}% Buy Bias ({data?.summary.buyTransactions} Buys / {data?.summary.sellTransactions} Sells)
              </div>
            </div>

            {/* FII Cash Flow Today */}
            <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-white/10 flex flex-col justify-between">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>FII NET CASH FLOW</span>
                <Briefcase className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-xl font-manrope font-bold text-cyan-300 font-mono">
                {data?.summary.fiiCashFlowToday}
              </div>
              <div className="text-[11px] text-slate-500">Foreign institutional cash equity balance</div>
            </div>

            {/* DII Cash Flow Today */}
            <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-white/10 flex flex-col justify-between">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>DII NET CASH FLOW</span>
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-xl font-manrope font-bold text-emerald-300 font-mono">
                {data?.summary.diiCashFlowToday}
              </div>
              <div className="text-[11px] text-slate-500">Domestic funds & insurance accumulation</div>
            </div>

            {/* Whale Alerts Count */}
            <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-white/10 flex flex-col justify-between">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>WHALE DEALS DETECTED</span>
                <AlertTriangle className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-manrope font-bold text-amber-400 font-mono">
                {data?.summary.whaleDealsCount} High-Conviction
              </div>
              <div className="text-[11px] text-slate-500">Transactions exceeding ₹50 Cr / $5M threshold</div>
            </div>
          </div>

          {/* Whale Alert Cards Deck */}
          <div>
            <h2 className="text-base font-bold text-slate-200 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
              High-Impact Whale Transactions
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data?.whaleAlerts.map((whale, idx) => {
                const isAccum = whale.type === "ACCUMULATION";
                return (
                  <div
                    key={idx}
                    className="glass-panel p-4 sm:p-5 rounded-2xl border border-white/10 hover:border-amber-500/30 transition-all relative overflow-hidden"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-base text-white">{whale.ticker}</span>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                              isAccum
                                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                            }`}
                          >
                            {whale.type}
                          </span>
                          <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-bold">
                            {whale.impact} IMPACT
                          </span>
                        </div>
                        <div className="text-xs text-slate-300 font-semibold mt-1">{whale.insider}</div>
                        <div className="text-[11px] text-slate-500">{whale.role}</div>
                      </div>

                      <div className="text-right">
                        <div className="text-base font-mono font-bold text-amber-400">{whale.amountFormatted}</div>
                        <div className="text-[10px] text-slate-500">{whale.date}</div>
                      </div>
                    </div>

                    <p className="text-xs text-slate-400 mt-3 pt-3 border-t border-white/5 leading-relaxed bg-[#05070D]/40 p-2.5 rounded-xl border border-white/5">
                      <span className="text-slate-300 font-semibold">Institutional Takeaway:</span> {whale.rationale}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Interactive Filter Bar */}
          <div className="glass-panel p-4 rounded-2xl border border-white/10 bg-[#070B14] flex flex-wrap items-center justify-between gap-4">
            {/* Search */}
            <div className="relative flex-1 min-w-[220px] max-w-md">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search ticker or executive name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#0D1322] border border-white/10 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400/50"
              />
            </div>

            {/* Type Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-medium">Deal Type:</span>
              <div className="flex flex-wrap bg-[#0D1322] rounded-xl p-1 border border-white/10">
                {["ALL", "BUY", "SELL", "BLOCK_DEAL", "OPTION_EXERCISE"].map((t) => (
                  <button
                    key={t}
                    onClick={() => setTypeFilter(t)}
                    className={`px-2.5 py-1 text-xs rounded-lg font-semibold transition-all cursor-pointer ${
                      typeFilter === t
                        ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {t.replace("_", " ")}
                  </button>
                ))}
              </div>
            </div>

            {/* Exchange */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-medium">Exchange:</span>
              <div className="flex bg-[#0D1322] rounded-xl p-1 border border-white/10">
                {["ALL", "NSE", "NASDAQ"].map((ex) => (
                  <button
                    key={ex}
                    onClick={() => setExchangeFilter(ex)}
                    className={`px-2.5 py-1 text-xs rounded-lg font-semibold transition-all cursor-pointer ${
                      exchangeFilter === ex
                        ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {ex}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Transactions Table */}
          <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-[#070B14]/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-3.5 px-4">Date & Ticker</th>
                    <th className="py-3.5 px-4">Insider / Entity</th>
                    <th className="py-3.5 px-4">Deal Type</th>
                    <th className="py-3.5 px-4">Shares</th>
                    <th className="py-3.5 px-4">Execution Price</th>
                    <th className="py-3.5 px-4">Total Value</th>
                    <th className="py-3.5 px-4">Source</th>
                    <th className="py-3.5 px-4">Notes & Rationale</th>
                    <th className="py-3.5 px-4 text-right">Deep Dive</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-xs font-sans">
                  {filteredTransactions.map((tx) => {
                    const isBuy = tx.type === "BUY" || tx.type === "BLOCK_DEAL";
                    const currency = tx.exchange === "NSE" ? "₹" : "$";

                    let typeBadge = "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30";
                    if (tx.type === "SELL") {
                      typeBadge = "bg-rose-500/15 text-rose-400 border border-rose-500/30";
                    } else if (tx.type === "BLOCK_DEAL") {
                      typeBadge = "bg-indigo-500/15 text-indigo-400 border border-indigo-500/30";
                    } else if (tx.type === "OPTION_EXERCISE") {
                      typeBadge = "bg-amber-500/15 text-amber-400 border border-amber-500/30";
                    }

                    return (
                      <tr key={tx.id} className="hover:bg-amber-950/15 transition-colors group">
                        <td className="py-3 px-4">
                          <div className="font-bold text-white font-mono group-hover:text-amber-400 transition-colors">
                            {tx.ticker}
                          </div>
                          <div className="text-[11px] text-slate-500">{tx.date}</div>
                        </td>

                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-200">{tx.insiderName}</div>
                          <div className="text-[11px] text-slate-400">{tx.position}</div>
                        </td>

                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-md font-mono text-[11px] font-bold ${typeBadge}`}>
                            {tx.type.replace("_", " ")}
                          </span>
                        </td>

                        <td className="py-3 px-4 font-mono text-slate-300">
                          {tx.shares.toLocaleString()}
                        </td>

                        <td className="py-3 px-4 font-mono text-slate-300">
                          {currency}
                          {tx.price.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </td>

                        <td className="py-3 px-4 font-mono font-bold text-amber-400">
                          {tx.valueFormatted}
                        </td>

                        <td className="py-3 px-4">
                          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 border border-white/5 text-slate-400 font-mono">
                            {tx.filingSource}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-slate-400 max-w-xs text-[11px]">
                          {tx.notes}
                        </td>

                        <td className="py-3 px-4 text-right">
                          <Link
                            href={`/deep-dive?ticker=${encodeURIComponent(tx.ticker)}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-amber-500 hover:text-black border border-white/10 hover:border-amber-400 text-slate-300 text-xs font-semibold transition-all"
                          >
                            Deep Dive
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
