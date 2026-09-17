"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Activity,
  Search,
  Filter,
  ArrowUpDown,
  Download,
  ExternalLink,
  RefreshCw,
  Sparkles,
  TrendingUp,
  ShieldAlert,
  Flame,
  Zap,
} from "lucide-react";
import QuantumLoader from "@/components/QuantumLoader";

interface ScreenerItem {
  ticker: string;
  name: string;
  exchange: "NSE" | "NASDAQ" | "NYSE";
  sector: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  avgVolume: number;
  volumeSurge: number;
  rsi14: number;
  sma50: number;
  sma200: number;
  distSma50: number;
  high52: number;
  low52: number;
  dist52wHigh: number;
  peRatio: number;
  marketCap: string;
  signals: string[];
}

type FilterPreset = "ALL" | "MOMENTUM" | "VALUE" | "OVERSOLD" | "GOLDEN_CROSS" | "52W_HIGH";
type SortField = "changePercent" | "rsi14" | "volumeSurge" | "dist52wHigh" | "price";

export default function ScreenerPage() {
  const [data, setData] = useState<ScreenerItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>("");

  // Filters state
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [preset, setPreset] = useState<FilterPreset>("ALL");
  const [exchangeFilter, setExchangeFilter] = useState<string>("ALL");
  const [minVolumeSurge, setMinVolumeSurge] = useState<number>(0);
  const [sortField, setSortField] = useState<SortField>("changePercent");
  const [sortAsc, setSortAsc] = useState<boolean>(false);

  const fetchScreenerData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/screener");
      if (!res.ok) throw new Error("Failed to fetch screener data");
      const json = await res.json();
      setData(json.data || []);
      setLastUpdated(json.lastUpdated || new Date().toISOString());
    } catch (err: any) {
      setError(err.message || "Network error loading screener data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScreenerData();
  }, []);

  // Filtered & Sorted Data
  const filteredData = useMemo(() => {
    return data
      .filter((item) => {
        // Search query
        if (
          searchQuery &&
          !item.ticker.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !item.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !item.sector.toLowerCase().includes(searchQuery.toLowerCase())
        ) {
          return false;
        }

        // Exchange filter
        if (exchangeFilter !== "ALL" && item.exchange !== exchangeFilter) {
          return false;
        }

        // Volume surge filter
        if (minVolumeSurge > 0 && item.volumeSurge < minVolumeSurge) {
          return false;
        }

        // Preset filters
        if (preset === "MOMENTUM") {
          return item.changePercent > 1.0 && item.rsi14 >= 55;
        }
        if (preset === "VALUE") {
          return item.peRatio > 0 && item.peRatio <= 22;
        }
        if (preset === "OVERSOLD") {
          return item.rsi14 <= 38;
        }
        if (preset === "GOLDEN_CROSS") {
          return item.signals.some((s) => s.includes("Golden"));
        }
        if (preset === "52W_HIGH") {
          return item.dist52wHigh <= 5.0;
        }

        return true;
      })
      .sort((a, b) => {
        const valA = a[sortField];
        const valB = b[sortField];
        if (typeof valA === "number" && typeof valB === "number") {
          return sortAsc ? valA - valB : valB - valA;
        }
        return 0;
      });
  }, [data, searchQuery, preset, exchangeFilter, minVolumeSurge, sortField, sortAsc]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const handleExportCSV = () => {
    if (!filteredData.length) return;
    const headers = [
      "Ticker",
      "Company",
      "Exchange",
      "Sector",
      "Price",
      "Change %",
      "RSI (14)",
      "50-SMA",
      "200-SMA",
      "Volume Surge",
      "52W High Dist %",
      "P/E Ratio",
      "Market Cap",
      "Signals",
    ];
    const rows = filteredData.map((d) => [
      d.ticker,
      `"${d.name}"`,
      d.exchange,
      `"${d.sector}"`,
      d.price,
      d.changePercent,
      d.rsi14,
      d.sma50,
      d.sma200,
      d.volumeSurge,
      d.dist52wHigh,
      d.peRatio,
      d.marketCap,
      `"${d.signals.join(", ")}"`,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Indra_MarketMind_Screener_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="glass-panel p-5 sm:p-7 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4 rounded-2xl border border-cyan-500/20 bg-gradient-to-r from-cyan-950/25 via-blue-950/15 to-indigo-950/20">
        <div className="absolute inset-0 bg-radial-[at_0%_0%] from-cyan-500/10 to-transparent pointer-events-none"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-cyan-500/10 text-cyan-400 rounded-xl border border-cyan-500/30 shadow-[0_0_15px_rgba(0,240,255,0.25)]">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-manrope font-bold text-white tracking-tight flex items-center gap-2">
                Institutional Stock Screener
                <span className="text-[10px] bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 px-2 py-0.5 rounded-full font-mono font-bold">
                  LIVE REAL DATA
                </span>
              </h1>
            </div>
          </div>
          <p className="text-slate-400 text-xs sm:text-sm max-w-2xl leading-relaxed">
            Multi-factor quantitative scanning across premier Indian equities and Wall Street tech leaders. Real-time
            RSI(14), Volume Z-scores, and 50/200-SMA golden cross tracking.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3 self-end md:self-auto">
          <button
            onClick={fetchScreenerData}
            disabled={loading}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-white/10 hover:border-cyan-500/40 text-slate-300 hover:text-white text-xs font-semibold transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-cyan-400" : ""}`} />
            Refresh Feed
          </button>

          <button
            onClick={handleExportCSV}
            disabled={filteredData.length === 0}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold shadow-[0_0_20px_rgba(0,240,255,0.3)] transition-all cursor-pointer disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV ({filteredData.length})
          </button>
        </div>
      </div>

      {/* Preset Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
        {[
          { id: "ALL", label: "All Equities", icon: Activity },
          { id: "MOMENTUM", label: "🚀 Momentum Breakout", icon: TrendingUp },
          { id: "VALUE", label: "💎 Value Contrarian (P/E < 22)", icon: Sparkles },
          { id: "OVERSOLD", label: "🌊 RSI Oversold (< 38)", icon: ShieldAlert },
          { id: "GOLDEN_CROSS", label: "⚡ Golden Cross Trend", icon: Zap },
          { id: "52W_HIGH", label: "🏆 52-Week High Runners", icon: Flame },
        ].map((item) => {
          const Icon = item.icon;
          const active = preset === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setPreset(item.id as FilterPreset)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                active
                  ? "bg-cyan-500 text-black font-bold shadow-[0_0_15px_rgba(0,240,255,0.35)]"
                  : "bg-[#0A0E1A] border border-white/10 text-slate-400 hover:text-slate-200 hover:border-white/20"
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${active ? "text-black" : "text-cyan-400"}`} />
              {item.label}
            </button>
          );
        })}
      </div>

      {/* Interactive Controls Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-white/10 bg-[#070B14] flex flex-wrap items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 min-w-[220px] max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search symbol (e.g. RELIANCE, NVDA, TCS)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0D1322] border border-white/10 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400/50"
          />
        </div>

        {/* Exchange Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">Exchange:</span>
          <div className="flex bg-[#0D1322] rounded-xl p-1 border border-white/10">
            {["ALL", "NSE", "NASDAQ"].map((ex) => (
              <button
                key={ex}
                onClick={() => setExchangeFilter(ex)}
                className={`px-2.5 py-1 text-xs rounded-lg font-semibold transition-all cursor-pointer ${
                  exchangeFilter === ex ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40" : "text-slate-400 hover:text-white"
                }`}
              >
                {ex}
              </button>
            ))}
          </div>
        </div>

        {/* Volume Surge Slider */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400 font-medium">Min Vol Surge:</span>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min={0}
              max={3.0}
              step={0.5}
              value={minVolumeSurge}
              onChange={(e) => setMinVolumeSurge(parseFloat(e.target.value))}
              className="w-24 accent-cyan-400 cursor-pointer"
            />
            <span className="text-xs font-mono font-bold text-cyan-300">{minVolumeSurge > 0 ? `${minVolumeSurge}x` : "Off"}</span>
          </div>
        </div>

        {/* Count summary */}
        <div className="text-xs text-slate-400 font-mono">
          Showing <span className="text-cyan-400 font-bold">{filteredData.length}</span> of {data.length} assets
        </div>
      </div>

      {/* Main Table */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <QuantumLoader text="Executing algorithmic multi-factor scan on live quotes..." />
        </div>
      ) : error ? (
        <div className="glass-panel p-8 text-center rounded-2xl border border-red-500/30 text-red-400">
          <p className="font-bold">{error}</p>
          <button
            onClick={fetchScreenerData}
            className="mt-3 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-xl text-xs font-bold"
          >
            Retry
          </button>
        </div>
      ) : filteredData.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-2xl border border-white/10">
          <Filter className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-300">No Equities Match Filter Criteria</h3>
          <p className="text-xs text-slate-500 mt-1">Try resetting the volume slider or selecting the "All Equities" preset.</p>
          <button
            onClick={() => {
              setPreset("ALL");
              setSearchQuery("");
              setMinVolumeSurge(0);
              setExchangeFilter("ALL");
            }}
            className="mt-4 px-4 py-2 bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-bold rounded-xl"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden">
          <div className="sm:hidden px-4 py-1.5 text-[10px] text-cyan-400 font-mono bg-cyan-950/20 border-b border-white/5 flex items-center justify-between">
            <span>👉 Swipe horizontally for all 10 quantitative factors</span>
            <span className="font-bold">10 Factors</span>
          </div>
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-[920px]">
              <thead>
                <tr className="border-b border-white/10 bg-[#070B14]/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Asset</th>
                  <th
                    className="py-3.5 px-4 cursor-pointer hover:text-white"
                    onClick={() => handleSort("price")}
                  >
                    <div className="flex items-center gap-1">
                      CMP
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    className="py-3.5 px-4 cursor-pointer hover:text-white"
                    onClick={() => handleSort("changePercent")}
                  >
                    <div className="flex items-center gap-1">
                      Day %
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    className="py-3.5 px-4 cursor-pointer hover:text-white"
                    onClick={() => handleSort("rsi14")}
                  >
                    <div className="flex items-center gap-1">
                      RSI (14)
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th
                    className="py-3.5 px-4 cursor-pointer hover:text-white"
                    onClick={() => handleSort("volumeSurge")}
                  >
                    <div className="flex items-center gap-1">
                      Vol Surge
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="py-3.5 px-4">50-SMA</th>
                  <th
                    className="py-3.5 px-4 cursor-pointer hover:text-white"
                    onClick={() => handleSort("dist52wHigh")}
                  >
                    <div className="flex items-center gap-1">
                      52W High Dist
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="py-3.5 px-4">P/E & Mcap</th>
                  <th className="py-3.5 px-4">Quantitative Signals</th>
                  <th className="py-3.5 px-4 text-right">Deep Dive</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs font-sans">
                {filteredData.map((item) => {
                  const isPositive = item.changePercent >= 0;
                  const currency = item.exchange === "NSE" ? "₹" : "$";

                  // RSI badge styling
                  let rsiBg = "bg-slate-800 text-slate-300";
                  if (item.rsi14 <= 35) rsiBg = "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30";
                  else if (item.rsi14 >= 68) rsiBg = "bg-rose-500/20 text-rose-400 border border-rose-500/30";

                  return (
                    <tr
                      key={item.ticker}
                      className="hover:bg-cyan-950/15 transition-colors group"
                    >
                      {/* Asset */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-white font-mono group-hover:text-cyan-400 transition-colors">
                          {item.ticker}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate max-w-[160px]">{item.name}</div>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800/80 text-slate-400 border border-white/5 font-mono">
                          {item.sector}
                        </span>
                      </td>

                      {/* CMP */}
                      <td className="py-3 px-4 font-mono font-bold text-slate-100">
                        {currency}
                        {item.price.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </td>

                      {/* Day % */}
                      <td className="py-3 px-4 font-mono font-semibold">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-bold ${
                            isPositive
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                          }`}
                        >
                          {isPositive ? "+" : ""}
                          {item.changePercent.toFixed(2)}%
                        </span>
                      </td>

                      {/* RSI (14) */}
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-md font-mono text-xs font-bold ${rsiBg}`}>
                          {item.rsi14}
                        </span>
                      </td>

                      {/* Vol Surge */}
                      <td className="py-3 px-4 font-mono">
                        <span
                          className={`font-bold ${
                            item.volumeSurge >= 1.5 ? "text-amber-400" : "text-slate-400"
                          }`}
                        >
                          {item.volumeSurge}x
                        </span>
                        <div className="text-[10px] text-slate-500">
                          {(item.volume / 1000000).toFixed(2)}M shares
                        </div>
                      </td>

                      {/* 50-SMA */}
                      <td className="py-3 px-4 font-mono text-slate-300">
                        {currency}
                        {item.sma50.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        <div
                          className={`text-[10px] ${
                            item.distSma50 >= 0 ? "text-emerald-400" : "text-rose-400"
                          }`}
                        >
                          {item.distSma50 >= 0 ? "+" : ""}
                          {item.distSma50}%
                        </div>
                      </td>

                      {/* 52W High Dist */}
                      <td className="py-3 px-4 font-mono text-slate-300">
                        -{item.dist52wHigh.toFixed(1)}%
                        <div className="w-16 h-1 bg-slate-800 rounded-full mt-1 overflow-hidden">
                          <div
                            className="h-full bg-cyan-400"
                            style={{ width: `${Math.max(10, 100 - item.dist52wHigh)}%` }}
                          ></div>
                        </div>
                      </td>

                      {/* P/E & Mcap */}
                      <td className="py-3 px-4 font-mono">
                        <div className="text-slate-200">{item.marketCap}</div>
                        <div className="text-[10px] text-slate-400">P/E: {item.peRatio || "N/A"}</div>
                      </td>

                      {/* Signals */}
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {item.signals.map((sig, i) => (
                            <span
                              key={i}
                              className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950/40 border border-cyan-500/20 text-cyan-300 font-mono"
                            >
                              {sig}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Deep Dive Action */}
                      <td className="py-3 px-4 text-right">
                        <Link
                          href={`/deep-dive?ticker=${encodeURIComponent(item.ticker)}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-cyan-500 hover:text-black border border-white/10 hover:border-cyan-400 text-slate-300 text-xs font-semibold transition-all shadow"
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
      )}
    </div>
  );
}
