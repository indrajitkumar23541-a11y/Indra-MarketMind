"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Search, 
  Bell, 
  Sun, 
  Moon, 
  X, 
  ArrowUpRight, 
  ArrowDownRight, 
  Check, 
  TrendingUp, 
  Radio, 
  LogIn, 
  ExternalLink,
  ShieldCheck,
  AlertTriangle
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface SearchResult {
  symbol: string;
  name: string;
  type: string;
  exchange: string;
  price?: number;
  change?: number;
  percent_change?: number;
}

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  type: "bullish" | "bearish" | "alert";
  read: boolean;
}

export default function TopNav() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: "1",
      title: "NIFTY 50 Volatility Alert",
      message: "NIFTY 50 trading at 23,488 (-1.22%). Support range tested near 23,460.",
      time: "2m ago",
      type: "bearish",
      read: false
    },
    {
      id: "2",
      title: "Global Fear & Greed Updated",
      message: "Market sentiment shifted into NEUTRAL (50/100) based on 7 technical indicators.",
      time: "10m ago",
      type: "alert",
      read: false
    },
    {
      id: "3",
      title: "Bitcoin Whale Activity",
      message: "BTC holds strong above $79,400 with +1.29% positive momentum.",
      time: "25m ago",
      type: "bullish",
      read: false
    }
  ]);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Keyboard shortcut (Ctrl + / or Cmd + /)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "/") {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === "Escape") {
        setSearchOpen(false);
        setNotifOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Focus input when modal opens
  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
      handleSearch("");
    }
  }, [searchOpen]);

  // Click outside notification listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced search query
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    setIsSearching(true);
    try {
      const res = await fetch(`/api/data/fetch/market/search?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data.results || []);
      }
    } catch (err) {
      console.error("Search fetch error", err);
    } finally {
      setIsSearching(false);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <>
      <header className="h-18 flex items-center justify-between px-6 sticky top-0 z-40 bg-[#0B1020]/90 backdrop-blur-md border-b border-white/5 flex-shrink-0">
        
        {/* Search Trigger */}
        <div className="flex-1 max-w-xl">
          <button
            onClick={() => setSearchOpen(true)}
            className="flex items-center w-80 bg-[#0F172A] hover:bg-[#131D35] border border-white/10 hover:border-cyan-500/30 rounded-xl py-2 px-3 text-sm text-slate-400 transition-all cursor-pointer group shadow-inner"
          >
            <Search className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 mr-2.5 transition-colors" />
            <span className="flex-1 text-left text-xs text-slate-400 group-hover:text-slate-300">
              Search stocks, news, indices...
            </span>
            <span className="px-1.5 py-0.5 rounded border border-white/10 bg-slate-800/80 text-[10px] text-slate-400 font-mono">
              Ctrl /
            </span>
          </button>
        </div>

        {/* Right Action Icons & Status */}
        <div className="flex items-center gap-5">
          
          {/* Live Market Pulse Indicator */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>LIVE TERMINAL</span>
          </div>

          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className="relative p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-[#00F0FF] rounded-full flex items-center justify-center text-[10px] font-bold text-black border-2 border-[#0B1020] animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Popover */}
            {notifOpen && (
              <div className="absolute right-0 mt-3 w-84 sm:w-96 rounded-2xl bg-[#0F172A] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.7)] p-4 z-50 backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-space font-bold text-sm text-white">Live Market Alerts</span>
                    {unreadCount > 0 && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                        {unreadCount} New
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-[11px] text-slate-400 hover:text-cyan-400 transition"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>

                <div className="space-y-2.5 max-h-72 overflow-y-auto custom-scrollbar pr-1">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className={cn(
                        "p-3 rounded-xl border text-xs transition-all",
                        n.read ? "bg-white/[0.02] border-white/5 opacity-75" : "bg-white/[0.06] border-white/10",
                        n.type === "bearish" ? "border-l-4 border-l-rose-500" : n.type === "bullish" ? "border-l-4 border-l-emerald-500" : "border-l-4 border-l-amber-500"
                      )}
                    >
                      <div className="flex items-center justify-between font-semibold text-slate-200 mb-1">
                        <span>{n.title}</span>
                        <span className="text-[10px] text-slate-500 font-normal">{n.time}</span>
                      </div>
                      <p className="text-slate-400 text-[11px] leading-relaxed">{n.message}</p>
                    </div>
                  ))}
                </div>

                <div className="pt-3 mt-3 border-t border-white/10 flex justify-between items-center text-xs">
                  <span className="text-slate-500 text-[11px]">System Status: Connected</span>
                  <Link
                    href="/alerts"
                    onClick={() => setNotifOpen(false)}
                    className="text-cyan-400 hover:underline font-semibold flex items-center gap-1 text-[11px]"
                  >
                    View All in Alerts Center <ArrowUpRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            )}
          </div>

          <div className="h-6 w-px bg-white/10"></div>

          {/* Clean Sign In Button (Profile placeholder until auth is implemented) */}
          <button 
            onClick={() => alert("Authentication system will be enabled soon! You are currently browsing as Guest with full live terminal access.")}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-cyan-500/30 bg-cyan-950/20 hover:bg-cyan-900/30 text-cyan-300 text-xs font-semibold transition-all hover:shadow-[0_0_15px_rgba(0,240,255,0.2)] cursor-pointer"
          >
            <LogIn className="w-3.5 h-3.5 text-cyan-400" />
            <span>Sign In</span>
          </button>

        </div>
      </header>

      {/* Global Interactive Search Modal */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-2xl rounded-2xl bg-[#0A0E1A] border border-cyan-500/30 shadow-[0_25px_60px_rgba(0,0,0,0.9)] overflow-hidden">
            
            {/* Modal Input Bar */}
            <div className="flex items-center px-4 py-3.5 border-b border-white/10 bg-[#0F172A]">
              <Search className="w-5 h-5 text-cyan-400 mr-3" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search stocks (RELIANCE, TCS, AAPL), crypto (BTC), or indices..."
                className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none font-sans"
              />
              {searchQuery && (
                <button onClick={() => handleSearch("")} className="text-slate-400 hover:text-white mr-2">
                  <X className="w-4 h-4" />
                </button>
              )}
              <button 
                onClick={() => setSearchOpen(false)}
                className="text-xs px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-slate-400 border border-white/10"
              >
                ESC
              </button>
            </div>

            {/* Results Body */}
            <div className="p-3 max-h-96 overflow-y-auto custom-scrollbar">
              {isSearching ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  <span className="inline-block animate-spin mr-2">⚡</span> Fetching real-time market quotes...
                </div>
              ) : searchResults.length > 0 ? (
                <div className="space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3 py-1">
                    Matching Securities & Assets
                  </div>
                  {searchResults.map((item) => (
                    <Link
                      key={item.symbol}
                      href={`/deep-dive?ticker=${encodeURIComponent(item.symbol)}`}
                      onClick={() => setSearchOpen(false)}
                      className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-cyan-950/40 border border-cyan-500/20 flex items-center justify-center font-bold text-xs text-cyan-400 font-mono">
                          {item.symbol.slice(0, 3)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm text-white group-hover:text-cyan-300 transition">
                              {item.symbol.replace(".NS", "")}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/10 text-slate-300 font-mono">
                              {item.exchange}
                            </span>
                            <span className="text-[10px] text-slate-500 font-medium">
                              {item.type}
                            </span>
                          </div>
                          <div className="text-xs text-slate-400">{item.name}</div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-sm font-bold font-mono text-white">
                          {item.price ? `₹${item.price.toLocaleString('en-IN')}` : "Live Quote"}
                        </div>
                        {item.percent_change !== undefined && item.percent_change !== null && (
                          <div className={cn("text-xs font-semibold flex items-center justify-end gap-0.5", item.percent_change >= 0 ? "text-emerald-400" : "text-rose-400")}>
                            {item.percent_change >= 0 ? "+" : ""}{item.percent_change.toFixed(2)}%
                            {item.percent_change >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                          </div>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-slate-400">
                  No matches found for "{searchQuery}". Try typing <span className="text-cyan-400 font-semibold">RELIANCE</span>, <span className="text-cyan-400 font-semibold">TCS</span>, or <span className="text-cyan-400 font-semibold">NIFTY</span>.
                </div>
              )}
            </div>

            {/* Modal Quick Links Footer */}
            <div className="px-4 py-2.5 bg-[#080C14] border-t border-white/5 flex items-center justify-between text-[11px] text-slate-500">
              <div className="flex items-center gap-3">
                <span>Quick:</span>
                <button onClick={() => handleSearch("NIFTY")} className="hover:text-cyan-400">NIFTY</button>
                <button onClick={() => handleSearch("RELIANCE")} className="hover:text-cyan-400">RELIANCE</button>
                <button onClick={() => handleSearch("TCS")} className="hover:text-cyan-400">TCS</button>
                <button onClick={() => handleSearch("BTC")} className="hover:text-cyan-400">BTC</button>
              </div>
              <div>Press <kbd className="font-mono bg-white/10 px-1 rounded text-slate-300">ESC</kbd> to close</div>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
