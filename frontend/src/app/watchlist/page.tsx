"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Star,
  Plus,
  Trash2,
  TrendingUp,
  TrendingDown,
  ExternalLink,
  RefreshCw,
  Search,
  DollarSign,
  PieChart,
  Edit2,
  Check,
  X,
  AlertCircle,
} from "lucide-react";
import QuantumLoader from "@/components/QuantumLoader";
import { useSettings } from "@/lib/SettingsContext";

interface WatchlistItem {
  ticker: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  high52: number;
  low52: number;
  currency: string;
  sharesOwned?: number;
  avgBuyPrice?: number;
  lastUpdated?: string;
}

const DEFAULT_WATCHLIST = [
  { ticker: "RELIANCE.NS", sharesOwned: 25, avgBuyPrice: 2850 },
  { ticker: "TCS.NS", sharesOwned: 15, avgBuyPrice: 3920 },
  { ticker: "HDFCBANK.NS", sharesOwned: 40, avgBuyPrice: 1580 },
  { ticker: "NVDA", sharesOwned: 30, avgBuyPrice: 112 },
  { ticker: "AAPL", sharesOwned: 20, avgBuyPrice: 215 },
  { ticker: "MSFT", sharesOwned: 10, avgBuyPrice: 420 },
];

export default function WatchlistPage() {
  const { formatCurrency, refreshIntervalMs, t } = useSettings();
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [newTicker, setNewTicker] = useState<string>("");
  const [addingError, setAddingError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState<boolean>(false);

  // Editing position modal
  const [editingTicker, setEditingTicker] = useState<string | null>(null);
  const [editShares, setEditShares] = useState<number>(0);
  const [editPrice, setEditPrice] = useState<number>(0);

  // Load saved tickers from localStorage or default
  const loadSavedWatchlist = (): { ticker: string; sharesOwned?: number; avgBuyPrice?: number }[] => {
    if (typeof window === "undefined") return DEFAULT_WATCHLIST;
    try {
      const saved = localStorage.getItem("indra_watchlist_v1");
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_WATCHLIST;
  };

  const saveWatchlist = (list: { ticker: string; sharesOwned?: number; avgBuyPrice?: number }[]) => {
    try {
      localStorage.setItem("indra_watchlist_v1", JSON.stringify(list));
    } catch {}
  };

  // Fetch live quotes for all tickers
  const fetchWatchlistQuotes = async (silent = false) => {
    if (!silent) setLoading(true);
    const saved = loadSavedWatchlist();
    const fetchedItems: WatchlistItem[] = [];

    await Promise.all(
      saved.map(async (savedItem) => {
        try {
          const res = await fetch(`/api/data/fetch/market/${encodeURIComponent(savedItem.ticker)}/quote`);
          if (!res.ok) return;
          const json = await res.json();
          if (json && json.c) {
            fetchedItems.push({
              ticker: savedItem.ticker,
              name: json.name || savedItem.ticker,
              price: json.c,
              change: json.d,
              changePercent: json.dp,
              high52: json.h52 || json.h || json.c * 1.15,
              low52: json.l52 || json.l || json.c * 0.85,
              currency: json.currency || (savedItem.ticker.endsWith(".NS") ? "INR" : "USD"),
              sharesOwned: savedItem.sharesOwned || 0,
              avgBuyPrice: savedItem.avgBuyPrice || json.c,
              lastUpdated: new Date().toLocaleTimeString(),
            });
          }
        } catch {}
      })
    );

    // Keep order as saved
    const tickerOrder = saved.map((s) => s.ticker);
    fetchedItems.sort((a, b) => tickerOrder.indexOf(a.ticker) - tickerOrder.indexOf(b.ticker));

    setItems(fetchedItems);
    if (!silent) setLoading(false);
  };

  useEffect(() => {
    fetchWatchlistQuotes();
    const interval = setInterval(() => {
      fetchWatchlistQuotes(true);
    }, refreshIntervalMs);
    return () => clearInterval(interval);
  }, [refreshIntervalMs]);

  const handleAddTicker = async (e: React.FormEvent) => {
    e.preventDefault();
    const sym = newTicker.trim().toUpperCase();
    if (!sym) return;

    if (items.some((it) => it.ticker.toUpperCase() === sym)) {
      setAddingError("Symbol is already in your watchlist");
      return;
    }

    setIsAdding(true);
    setAddingError(null);

    try {
      const res = await fetch(`/api/data/fetch/market/${encodeURIComponent(sym)}/quote`);
      if (!res.ok) throw new Error("Invalid symbol or data unavailable");
      const json = await res.json();

      if (!json || !json.c) {
        throw new Error("Could not find quote for " + sym);
      }

      const newItem: WatchlistItem = {
        ticker: sym,
        name: json.name || sym,
        price: json.c,
        change: json.d,
        changePercent: json.dp,
        high52: json.h52 || json.h || json.c * 1.15,
        low52: json.l52 || json.l || json.c * 0.85,
        currency: json.currency || (sym.endsWith(".NS") ? "INR" : "USD"),
        sharesOwned: 0,
        avgBuyPrice: json.c,
        lastUpdated: new Date().toLocaleTimeString(),
      };

      const updated = [...items, newItem];
      setItems(updated);
      saveWatchlist(updated.map((u) => ({ ticker: u.ticker, sharesOwned: u.sharesOwned, avgBuyPrice: u.avgBuyPrice })));
      setNewTicker("");
    } catch (err: any) {
      setAddingError(err.message || "Failed to add ticker");
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemove = (ticker: string) => {
    const updated = items.filter((it) => it.ticker !== ticker);
    setItems(updated);
    saveWatchlist(updated.map((u) => ({ ticker: u.ticker, sharesOwned: u.sharesOwned, avgBuyPrice: u.avgBuyPrice })));
  };

  const handleSavePosition = (ticker: string) => {
    const updated = items.map((it) => {
      if (it.ticker === ticker) {
        return { ...it, sharesOwned: editShares, avgBuyPrice: editPrice };
      }
      return it;
    });
    setItems(updated);
    saveWatchlist(updated.map((u) => ({ ticker: u.ticker, sharesOwned: u.sharesOwned, avgBuyPrice: u.avgBuyPrice })));
    setEditingTicker(null);
  };

  // Portfolio aggregates
  const totalValueINR = items
    .filter((it) => it.currency === "INR")
    .reduce((acc, it) => acc + (it.sharesOwned || 0) * it.price, 0);

  const totalCostINR = items
    .filter((it) => it.currency === "INR")
    .reduce((acc, it) => acc + (it.sharesOwned || 0) * (it.avgBuyPrice || it.price), 0);

  const netPLINR = totalValueINR - totalCostINR;
  const plPercentINR = totalCostINR > 0 ? (netPLINR / totalCostINR) * 100 : 0;

  const totalValueUSD = items
    .filter((it) => it.currency === "USD")
    .reduce((acc, it) => acc + (it.sharesOwned || 0) * it.price, 0);

  const totalCostUSD = items
    .filter((it) => it.currency === "USD")
    .reduce((acc, it) => acc + (it.sharesOwned || 0) * (it.avgBuyPrice || it.price), 0);

  const netPLUSD = totalValueUSD - totalCostUSD;
  const plPercentUSD = totalCostUSD > 0 ? (netPLUSD / totalCostUSD) * 100 : 0;

  return (
    <div className="space-y-6 pb-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="glass-panel p-5 sm:p-7 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4 rounded-2xl border border-pink-500/20 bg-gradient-to-r from-pink-950/25 via-rose-950/15 to-purple-950/20">
        <div className="absolute inset-0 bg-radial-[at_0%_0%] from-pink-500/10 to-transparent pointer-events-none"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-pink-500/10 text-pink-400 rounded-xl border border-pink-500/30 shadow-[0_0_15px_rgba(236,72,153,0.25)]">
              <Star className="w-5 h-5 fill-pink-400/20" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-manrope font-bold text-white tracking-tight flex items-center gap-2">
                Live Interactive Watchlist & Paper Portfolio
                <span className="text-[10px] bg-pink-500/20 text-pink-300 border border-pink-500/30 px-2 py-0.5 rounded-full font-mono font-bold">
                  LOCAL PERSISTENCE
                </span>
              </h1>
            </div>
          </div>
          <p className="text-slate-400 text-xs sm:text-sm max-w-2xl leading-relaxed">
            Personalized market radar with real-time price feeds, custom position sizing, and live mark-to-market P&L.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3 self-end md:self-auto">
          <button
            onClick={() => fetchWatchlistQuotes()}
            disabled={loading}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-white/10 hover:border-pink-500/40 text-slate-300 hover:text-white text-xs font-semibold transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-pink-400" : ""}`} />
            {t("watchlist.refreshBtn")}
          </button>
        </div>
      </div>

      {/* Quick Add Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-white/10 bg-[#070B14]">
        <form onSubmit={handleAddTicker} className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Add symbol (e.g. INFY.NS, TSLA, SBIN.NS, AMD)..."
              value={newTicker}
              onChange={(e) => {
                setNewTicker(e.target.value);
                setAddingError(null);
              }}
              className="w-full bg-[#0D1322] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-pink-400/50 uppercase"
            />
          </div>
          <button
            type="submit"
            disabled={isAdding || !newTicker.trim()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-pink-500 hover:bg-pink-400 text-black text-xs font-bold shadow-[0_0_15px_rgba(236,72,153,0.3)] transition-all cursor-pointer disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            {isAdding ? "Adding..." : t("watchlist.addBtn")}
          </button>
        </form>
        {addingError && (
          <div className="flex items-center gap-1.5 text-xs text-rose-400 mt-2">
            <AlertCircle className="w-3.5 h-3.5" />
            {addingError}
          </div>
        )}
      </div>

      {/* Portfolio Summaries */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* India Segment P&L */}
        <div className="glass-panel p-5 rounded-2xl border border-white/10 bg-gradient-to-br from-cyan-950/20 to-[#070B14]">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>🇮🇳 {t("watchlist.indiaPortfolio")}</span>
            <span className="text-xs text-cyan-400 font-mono">NSE / BSE</span>
          </div>
          <div className="flex items-baseline justify-between mb-3">
            <div>
              <div className="text-2xl font-bold text-white font-mono">
                {formatCurrency(totalValueINR, { from: "INR" })}
              </div>
              <div className="text-[11px] text-slate-500">{t("watchlist.invested")}: {formatCurrency(totalCostINR, { from: "INR" })}</div>
            </div>
            <div className="text-right">
              <div className={`text-lg font-bold font-mono ${netPLINR >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                {netPLINR >= 0 ? "+" : ""}{formatCurrency(netPLINR, { from: "INR" })}
              </div>
              <div className={`text-xs font-bold font-mono ${plPercentINR >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                ({plPercentINR >= 0 ? "+" : ""}{plPercentINR.toFixed(2)}%)
              </div>
            </div>
          </div>
        </div>

        {/* US Segment P&L */}
        <div className="glass-panel p-5 rounded-2xl border border-white/10 bg-gradient-to-br from-purple-950/20 to-[#070B14]">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>🇺🇸 {t("watchlist.usPortfolio")}</span>
            <span className="text-xs text-purple-400 font-mono">NASDAQ / NYSE</span>
          </div>
          <div className="flex items-baseline justify-between mb-3">
            <div>
              <div className="text-2xl font-bold text-white font-mono">
                {formatCurrency(totalValueUSD, { from: "USD" })}
              </div>
              <div className="text-[11px] text-slate-500">{t("watchlist.invested")}: {formatCurrency(totalCostUSD, { from: "USD" })}</div>
            </div>
            <div className="text-right">
              <div className={`text-lg font-bold font-mono ${netPLUSD >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                {netPLUSD >= 0 ? "+" : ""}{formatCurrency(netPLUSD, { from: "USD" })}
              </div>
              <div className={`text-xs font-bold font-mono ${plPercentUSD >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                ({plPercentUSD >= 0 ? "+" : ""}{plPercentUSD.toFixed(2)}%)
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Watchlist Cards & Table */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <QuantumLoader text="Fetching live real-time market prices for your saved watchlist..." />
        </div>
      ) : items.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-2xl border border-white/10">
          <Star className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-300">Your Watchlist is Empty</h3>
          <p className="text-xs text-slate-500 mt-1">Use the search box above to add your first stock!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => {
            const symSymbol = item.currency === "INR" ? "₹" : "$";
            const isPositive = item.changePercent >= 0;
            const positionValue = (item.sharesOwned || 0) * item.price;
            const positionCost = (item.sharesOwned || 0) * (item.avgBuyPrice || item.price);
            const positionPL = positionValue - positionCost;
            const plPercent = positionCost > 0 ? (positionPL / positionCost) * 100 : 0;

            const isEditing = editingTicker === item.ticker;

            return (
              <div
                key={item.ticker}
                className="glass-panel p-5 rounded-2xl border border-white/10 hover:border-pink-500/30 transition-all relative flex flex-col justify-between"
              >
                <div>
                  {/* Top line */}
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-lg text-white">{item.ticker}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                          {item.currency}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 truncate max-w-[200px]">{item.name}</div>
                    </div>

                    <button
                      onClick={() => handleRemove(item.ticker)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Remove from Watchlist"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* CMP and Day Change */}
                  <div className="my-3 flex items-baseline justify-between">
                    <div className="text-2xl font-mono font-extrabold text-white">
                      {formatCurrency(item.price, { from: item.currency as any })}
                    </div>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-bold font-mono ${
                        isPositive
                          ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                          : "bg-rose-500/15 text-rose-400 border border-rose-500/20"
                      }`}
                    >
                      {isPositive ? "+" : ""}
                      {item.changePercent.toFixed(2)}%
                    </span>
                  </div>

                  {/* 52W High/Low Progress */}
                  <div className="mb-4">
                    <div className="flex justify-between text-[10px] text-slate-500 font-mono mb-1">
                      <span>52W L: {formatCurrency(item.low52, { from: item.currency as any })}</span>
                      <span>52W H: {formatCurrency(item.high52, { from: item.currency as any })}</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-linear-to-r from-pink-500 to-cyan-400"
                        style={{
                          width: `${Math.min(
                          100,
                          Math.max(5, ((item.price - item.low52) / (item.high52 - item.low52 || 1)) * 100)
                        )}%`,
                      }}
                    />
                    </div>
                  </div>

                  {/* Simulated Position Info */}
                  <div className="p-3 bg-[#05070D]/60 rounded-xl border border-white/5 text-xs mb-3">
                    {isEditing ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] text-slate-400">Qty:</span>
                          <input
                            type="number"
                            value={editShares}
                            onChange={(e) => setEditShares(parseFloat(e.target.value) || 0)}
                            className="w-20 bg-slate-900 border border-white/20 rounded px-2 py-0.5 text-xs text-white font-mono"
                          />
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] text-slate-400">Buy Price:</span>
                          <input
                            type="number"
                            value={editPrice}
                            onChange={(e) => setEditPrice(parseFloat(e.target.value) || 0)}
                            className="w-24 bg-slate-900 border border-white/20 rounded px-2 py-0.5 text-xs text-white font-mono"
                          />
                        </div>
                        <div className="flex justify-end gap-2 pt-1">
                          <button
                            onClick={() => setEditingTicker(null)}
                            className="p-1 text-slate-400 hover:text-white"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleSavePosition(item.ticker)}
                            className="p-1 text-emerald-400 hover:text-emerald-300"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-[10px] text-slate-500 uppercase">Position ({item.sharesOwned || 0} Shs)</div>
                          <div className="font-mono font-semibold text-slate-200">
                            {formatCurrency(positionValue, { from: item.currency as any })}
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-[10px] text-slate-500 uppercase">Unrealized P&L</div>
                          <div
                            className={`font-mono font-bold ${
                              positionPL >= 0 ? "text-emerald-400" : "text-rose-400"
                            }`}
                          >
                            {positionPL >= 0 ? "+" : ""}
                            {formatCurrency(positionPL, { from: item.currency as any })} ({plPercent >= 0 ? "+" : ""}
                            {plPercent.toFixed(1)}%)
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            setEditingTicker(item.ticker);
                            setEditShares(item.sharesOwned || 0);
                            setEditPrice(item.avgBuyPrice || item.price);
                          }}
                          className="p-1 text-slate-500 hover:text-slate-300 ml-1"
                          title="Edit Position"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom link */}
                <Link
                  href={`/deep-dive?ticker=${encodeURIComponent(item.ticker)}`}
                  className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-slate-900 hover:bg-pink-500 hover:text-black border border-white/10 hover:border-pink-400 text-slate-300 text-xs font-semibold transition-all"
                >
                  Inspect in Deep Dive
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
