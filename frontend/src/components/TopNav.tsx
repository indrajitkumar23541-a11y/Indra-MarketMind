"use client";

import { useState, useEffect, useRef, useCallback } from "react";
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
  Menu,
  ChevronDown,
  LogOut,
  Settings as SettingsIcon,
  Zap,
  Sparkles,
  Smartphone,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useNav } from "@/lib/NavContext";
import { useSettings } from "@/lib/SettingsContext";
import { useMarketMindAuth } from "@/lib/AuthContext";
import { useNotifications } from "@/lib/NotificationContext";
import { useAppStatus } from "@/lib/useAppStatus";
import UniversalAppDownloadModal from "./UniversalAppDownloadModal";

interface SearchResult {
  symbol: string;
  name: string;
  type: string;
  exchange: string;
  price?: number;
  change?: number;
  percent_change?: number;
}

export default function TopNav() {
  const { toggleMobileNav } = useNav();
  const { t, formatCurrency } = useSettings();
  const { isAppDownloadedOrInstalled } = useAppStatus();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const [notifOpen, setNotifOpen] = useState(false);
  const [downloadModalOpen, setDownloadModalOpen] = useState(false);
  const {
    notifications,
    unreadCount,
    markAllAsRead,
    markAsRead,
    clearAll,
    triggerTestNotification,
    requestPushPermission,
    pushPermission,
  } = useNotifications();

  const searchInputRef = useRef<HTMLInputElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const { user, isSignedIn, openSignIn, signOut } = useMarketMindAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

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
        setUserMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Debounced search query
  const handleSearch = useCallback(async (query: string) => {
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
  }, []);

  // Focus input when modal opens and load initial items
  useEffect(() => {
    if (searchOpen) {
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
        handleSearch("");
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [searchOpen, handleSearch]);

  // Click outside listener for notifications and user menu
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <header className="h-16 sm:h-18 flex items-center justify-between px-2.5 sm:px-6 sticky top-0 z-40 bg-[#0B1020]/95 backdrop-blur-md border-b border-white/5 flex-shrink-0">
        
        {/* Left: Mobile Drawer Trigger + Brand */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {/* Mobile Drawer Hamburger Button */}
          <button
            onClick={toggleMobileNav}
            aria-label="Open Navigation Drawer"
            className="lg:hidden p-1.5 sm:p-2 text-slate-300 hover:text-white rounded-lg hover:bg-white/5 transition-colors cursor-pointer shrink-0"
          >
            <Menu className="w-5 h-5 text-cyan-400" />
          </button>

          {/* Mobile Logo Brand */}
          <Link href="/" className="lg:hidden flex items-center gap-1.5 shrink-0 group">
            <img 
              src="/logo.png" 
              alt="Logo" 
              className="w-7 h-7 rounded-lg object-cover border border-[#00F0FF]/40 shadow-sm shrink-0" 
            />
            <span className="font-space font-bold text-xs sm:text-sm text-white hidden md:inline">
              Indra-<span className="text-[#00F0FF]">MM</span>
            </span>
          </Link>
        </div>

        {/* Center / Desktop Search Bar (Hidden on phone screens to prevent clutter/overlap) */}
        <div className="hidden sm:flex items-center flex-1 max-w-xs md:max-w-md lg:max-w-lg mx-3 md:mx-6">
          <button
            onClick={() => setSearchOpen(true)}
            className="flex items-center w-full bg-[#0F172A] hover:bg-[#131D35] border border-white/10 hover:border-cyan-500/30 rounded-xl py-1.5 sm:py-2 px-3 text-sm text-slate-400 transition-all cursor-pointer group shadow-inner"
          >
            <Search className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 mr-2.5 transition-colors shrink-0" />
            <span className="flex-1 text-left text-xs text-slate-400 group-hover:text-slate-300 truncate">
              {t("header.searchPlaceholder")}
            </span>
            <span className="hidden md:inline px-1.5 py-0.5 rounded border border-white/10 bg-slate-800/80 text-[10px] text-slate-400 font-mono shrink-0 ml-1">
              Ctrl /
            </span>
          </button>
        </div>

        {/* Right Action Icons & Status */}
        <div className="flex items-center gap-1.5 sm:gap-3 md:gap-4 shrink-0">
          
          {/* Mobile Quick Search Button (Tap to open full search modal on phone) */}
          <button
            onClick={() => setSearchOpen(true)}
            aria-label="Search markets and stocks"
            className="sm:hidden p-1.5 text-slate-300 hover:text-cyan-400 rounded-lg hover:bg-white/5 active:bg-white/10 transition-colors cursor-pointer shrink-0"
            title="Search"
          >
            <Search className="w-5 h-5 text-cyan-400/90" />
          </button>

          {/* Live Market Pulse Indicator (Hidden on small mobile) */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold shrink-0">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>LIVE TERMINAL</span>
          </div>

          {/* Universal App Download Hub Trigger (Hidden once downloaded or inside installed app) */}
          {!isAppDownloadedOrInstalled && (
            <button
              onClick={() => setDownloadModalOpen(true)}
              className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-xl border border-cyan-500/30 bg-cyan-950/20 hover:bg-cyan-900/30 text-cyan-300 text-xs font-semibold transition-all hover:shadow-[0_0_15px_rgba(0,240,255,0.25)] cursor-pointer shrink-0 group"
              title="Get App for Android, Laptop & Apple"
            >
              <Smartphone className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 transition-transform shrink-0" />
              <span className="font-space">
                <span className="sm:hidden text-[11px]">App</span>
                <span className="hidden sm:inline">Get App</span>
              </span>
            </button>
          )}

          {/* Notifications */}
          <div className="relative shrink-0" ref={notifRef}>
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className="relative p-1.5 sm:p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors cursor-pointer shrink-0"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-[#00F0FF] rounded-full flex items-center justify-center text-[10px] font-bold text-black border-2 border-[#0B1020] animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Responsive Notification Popover */}
            {notifOpen && (
              <>
                {/* Mobile Backdrop to dismiss on tap */}
                <div
                  className="fixed inset-0 bg-black/50 backdrop-blur-xs z-40 sm:hidden animate-in fade-in duration-100"
                  onClick={() => setNotifOpen(false)}
                />

                <div className="fixed inset-x-3 top-[66px] sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:mt-2.5 w-auto sm:w-96 sm:max-w-sm rounded-2xl bg-[#0F172A]/95 sm:bg-[#0F172A] border border-cyan-500/30 sm:border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.95)] p-3.5 sm:p-4 z-50 backdrop-blur-2xl animate-in fade-in slide-in-from-top-2 duration-200">
                  {/* Popover Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-space font-bold text-sm text-white">Live Market Alerts</span>
                      {unreadCount > 0 ? (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 font-mono">
                          {unreadCount} New
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-mono">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          LIVE
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {notifications.length > 0 && (
                        <>
                          <button
                            onClick={markAllAsRead}
                            className="text-[11px] text-slate-400 hover:text-cyan-400 transition cursor-pointer"
                          >
                            Read all
                          </button>
                          <button
                            onClick={clearAll}
                            className="text-[11px] text-slate-400 hover:text-rose-400 transition cursor-pointer"
                          >
                            Clear
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => setNotifOpen(false)}
                        className="sm:hidden p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer"
                        aria-label="Close notifications"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Body: Empty State or Live Notifications */}
                  {notifications.length === 0 ? (
                    <div className="py-7 px-3 text-center space-y-3">
                      <div className="relative w-11 h-11 mx-auto flex items-center justify-center">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400/20" />
                        <div className="relative w-9 h-9 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                          <Zap className="w-4 h-4" />
                        </div>
                      </div>
                      <div>
                        <h4 className="text-xs font-space font-bold text-white">Live Monitoring Active</h4>
                        <p className="text-[11px] text-slate-400 mt-1 max-w-[240px] mx-auto leading-relaxed">
                          Scanning real-time news & market spikes. Breaking alerts will appear instantly.
                        </p>
                      </div>
                      <button
                        onClick={triggerTestNotification}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-[11px] font-semibold cursor-pointer transition-all active:scale-95"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Send Test Live Alert</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[50vh] sm:max-h-72 overflow-y-auto custom-scrollbar pr-1">
                      {notifications.map((n) => (
                        <Link
                          key={n.id}
                          href={n.url || "/live-feed"}
                          onClick={() => {
                            markAsRead(n.id);
                            setNotifOpen(false);
                          }}
                          className={cn(
                            "block p-2.5 sm:p-3 rounded-xl border text-xs transition-all hover:bg-white/10 group cursor-pointer",
                            n.read ? "bg-white/[0.02] border-white/5 opacity-70" : "bg-white/[0.06] border-white/15",
                            n.type === "bearish"
                              ? "border-l-4 border-l-rose-500"
                              : n.type === "bullish"
                              ? "border-l-4 border-l-emerald-500"
                              : "border-l-4 border-l-cyan-400"
                          )}
                        >
                          <div className="flex items-center justify-between font-semibold text-slate-200 mb-1">
                            <span className="truncate pr-2 group-hover:text-cyan-300 transition-colors font-medium">
                              {n.title}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono shrink-0">{n.time}</span>
                          </div>
                          <p className="text-slate-400 text-[11px] leading-relaxed line-clamp-2">{n.message}</p>
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* Footer */}
                  <div className="pt-3 mt-3 border-t border-white/10 flex justify-between items-center text-xs">
                    {pushPermission !== "granted" ? (
                      <button
                        onClick={requestPushPermission}
                        className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer font-medium"
                      >
                        <Bell className="w-3 h-3" />
                        <span>Enable Push Alerts</span>
                      </button>
                    ) : (
                      <span className="text-emerald-400 text-[10px] sm:text-[11px] flex items-center gap-1 font-mono">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        Push Active
                      </span>
                    )}
                    <Link
                      href="/alerts"
                      onClick={() => setNotifOpen(false)}
                      className="text-cyan-400 hover:underline font-semibold flex items-center gap-1 text-[11px]"
                    >
                      Alerts Center <ArrowUpRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="h-4 sm:h-6 w-px bg-white/10 shrink-0"></div>

          {/* Dynamic User Profile or Sign In Button */}
          {!isSignedIn ? (
            <button
              onClick={openSignIn}
              className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-xl border border-cyan-400/50 bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 hover:from-cyan-500/30 hover:to-indigo-500/30 text-cyan-300 text-xs font-semibold shadow-[0_0_15px_rgba(0,240,255,0.2)] hover:shadow-[0_0_20px_rgba(0,240,255,0.4)] active:scale-95 transition-all cursor-pointer shrink-0"
            >
              <LogIn className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span className="font-space font-bold whitespace-nowrap text-[11px] sm:text-xs">Sign In</span>
            </button>
          ) : (
            <div className="relative shrink-0" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-1.5 sm:gap-2 px-1.5 sm:px-2.5 py-1.5 rounded-xl border border-cyan-500/30 bg-cyan-950/20 hover:bg-cyan-900/30 text-cyan-300 text-xs font-semibold transition-all hover:shadow-[0_0_15px_rgba(0,240,255,0.2)] cursor-pointer shrink-0"
              >
                {user?.imageUrl ? (
                  <img
                    src={user.imageUrl}
                    alt={user.fullName}
                    className="w-5 h-5 rounded-md object-cover border border-cyan-400/40 shrink-0"
                  />
                ) : (
                  <div className="w-5 h-5 rounded-md bg-gradient-to-tr from-cyan-400 to-indigo-600 flex items-center justify-center text-black font-bold text-[10px] shrink-0 shadow-sm">
                    {user?.initials || "U"}
                  </div>
                )}
                <span className="hidden sm:inline font-space truncate max-w-[120px]">
                  {user?.firstName || user?.fullName || "Member"}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400 hidden sm:block" />
              </button>

              {/* User Dropdown */}
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#0A0E1A] border border-cyan-500/30 shadow-[0_15px_40px_rgba(0,0,0,0.85)] p-2 z-50 text-xs space-y-1 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-2.5 py-2 border-b border-white/10">
                    <div className="font-space font-bold text-white truncate">
                      {user?.fullName || "Member"}
                    </div>
                    {user?.email && (
                      <div className="text-[10px] text-slate-400 font-mono truncate">
                        {user.email}
                      </div>
                    )}
                    <span className="mt-1.5 inline-block text-[9px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-mono font-bold">
                      ACTIVE MEMBER
                    </span>
                  </div>
                  <Link
                    href="/settings"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-white/5 text-slate-300 hover:text-white transition-colors"
                  >
                    <SettingsIcon className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Settings & Preferences</span>
                  </Link>
                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      signOut();
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-red-500/10 text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          )}

        </div>
      </header>

      {/* Global Interactive Search Modal */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-14 sm:pt-20 px-3 sm:px-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
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
                          {item.price ? formatCurrency(item.exchange === "NSE" || item.exchange === "BSE" ? item.price / 86.5 : item.price) : "Live Quote"}
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
                  No matches found for &quot;{searchQuery}&quot;. Try typing <span className="text-cyan-400 font-semibold">RELIANCE</span>, <span className="text-cyan-400 font-semibold">TCS</span>, or <span className="text-cyan-400 font-semibold">NIFTY</span>.
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

      {/* Universal App Download Hub Modal */}
      <UniversalAppDownloadModal
        isOpen={downloadModalOpen}
        onClose={() => setDownloadModalOpen(false)}
      />
    </>
  );
}
