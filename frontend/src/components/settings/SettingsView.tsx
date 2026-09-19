"use client";

import React, { useState } from "react";
import {
  User,
  Bell,
  TrendingUp,
  Brain,
  Palette,
  Info,
  Check,
  CheckCircle2,
  Trash2,
  Download,
  Shield,
  Smartphone,
  ExternalLink,
  ChevronRight,
  Volume2,
  Globe,
  Moon,
  Sun,
  Sparkles,
  LogIn,
  LogOut,
  KeyRound,
} from "lucide-react";
import { useSettings, AppSettings } from "@/lib/SettingsContext";
import { useMarketMindAuth } from "@/lib/AuthContext";
import { useAppStatus } from "@/lib/useAppStatus";
import { useUser } from "@clerk/nextjs";

// Luxury Apple/iOS-Style Toggle Switch
function ToggleSwitch({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (val: boolean) => void;
  label: string;
  description?: string;
}) {
  return (
    <div className="flex items-center justify-between py-3 px-1 border-b border-white/5 last:border-0 gap-4">
      <div className="flex-1 min-w-0 pr-2">
        <div className="text-sm font-semibold text-white tracking-tight">
          {label}
        </div>
        {description && (
          <div className="text-xs text-slate-400 mt-0.5 leading-relaxed">
            {description}
          </div>
        )}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
          checked ? "bg-cyan-400 shadow-[0_0_12px_rgba(0,240,255,0.4)]" : "bg-slate-700"
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-black shadow-md ring-0 transition duration-200 ease-in-out ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}

export default function SettingsView() {
  const {
    settings,
    updateSettings,
    saveSettings,
    clearAppStorage,
    exportSettingsJson,
    playAlertChime,
    activeTheme,
  } = useSettings();

  const setSettings = (newSettings: AppSettings) => {
    updateSettings(newSettings);
  };

  const { user, isSignedIn, openSignIn, signOut, isClerkConfigured, updateUser } = useMarketMindAuth();
  const { user: clerkUser } = useUser();
  const { isAppDownloadedOrInstalled, resetAppDownloadedStatus, markAppAsDownloaded } = useAppStatus();

  const [activeTab, setActiveTab] = useState<
    "account" | "notifications" | "trading" | "copilot" | "appearance" | "about"
  >("account");
  const [showToast, setShowToast] = useState(false);
  const [cacheSize, setCacheSize] = useState("142.8 KB");
  const [settingsImgError, setSettingsImgError] = useState(false);

  const handleSave = () => {
    saveSettings();
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
    playAlertChime(880, 0.08);
  };

  const handleClearCache = async () => {
    await clearAppStorage();
    setCacheSize("0.0 KB");
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  const handleExport = () => {
    exportSettingsJson();
  };

  const TABS = [
    { id: "account", label: "Account", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "trading", label: "Trading", icon: TrendingUp },
    { id: "copilot", label: "AI Copilot", icon: Brain },
    { id: "appearance", label: "Appearance & Language", icon: Globe },
    { id: "about", label: "About", icon: Info },
  ] as const;

  return (
    <div className="max-w-6xl mx-auto w-full space-y-4 sm:space-y-6 pb-16 sm:pb-8 px-2 sm:px-4 md:px-6 pt-1 sm:pt-3">
      {/* Floating Save Toast */}
      {showToast && (
        <div className="fixed top-20 right-4 sm:right-8 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="p-3.5 rounded-2xl bg-[#091524] border border-cyan-500/50 text-cyan-200 text-xs sm:text-sm font-space font-semibold shadow-[0_10px_35px_rgba(0,0,0,0.8)] flex items-center gap-2.5 backdrop-blur-xl">
            <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0" />
            <span>Settings Saved Successfully!</span>
          </div>
        </div>
      )}

      {/* Profile Overview Card (Rendered ONLY when a user is signed in) */}
      {isSignedIn && user && (
        <div className="p-4 sm:p-5 rounded-2xl bg-[#0A101E]/90 border border-cyan-500/30 backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3.5">
            {user.imageUrl && !settingsImgError ? (
              <img
                src={user.imageUrl}
                alt={user.fullName}
                onError={() => setSettingsImgError(true)}
                className="w-12 h-12 rounded-2xl object-cover border-2 border-cyan-400/50 shadow-[0_0_15px_rgba(0,240,255,0.4)] shrink-0"
              />
            ) : (
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-400 to-indigo-600 flex items-center justify-center text-black font-bold text-lg shadow-[0_0_15px_rgba(0,240,255,0.4)] shrink-0">
                {user.initials || "U"}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-space font-bold text-base text-white">
                  {user.fullName}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-mono font-bold tracking-wide shadow-sm">
                  ACTIVE MEMBER
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Manage your verified account profile and cloud-synchronized settings
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 justify-between sm:justify-end">
            <div className="text-right">
              <span className="text-xs font-mono text-emerald-400 flex items-center gap-1.5 justify-end">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Active Session
              </span>
              <span className="text-[11px] text-slate-400 font-mono mt-0.5 block">
                {user.email}
              </span>
            </div>
            <button
              onClick={signOut}
              className="px-3 py-1.5 rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Two-Pane Layout (Left Tabs + Right Settings Content) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 sm:gap-6">
        
        {/* Left Tabs (Desktop: Vertical Sidebar | Mobile: Horizontal Scroll) */}
        <div className="md:col-span-1">
          {/* Mobile & Tablet Pill Bar */}
          <div className="flex md:hidden items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar -mx-1 px-1">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer transition-all ${
                    isActive
                      ? "bg-cyan-400 text-black font-bold shadow-[0_0_12px_rgba(0,240,255,0.4)]"
                      : "bg-[#0A101E] text-slate-400 border border-white/5"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Desktop Vertical Menu */}
          <div className="hidden md:flex flex-col space-y-1.5 p-2 rounded-2xl bg-[#0A101E]/80 border border-white/10">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer text-left ${
                    isActive
                      ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 shadow-sm"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-cyan-400" : "text-slate-400"}`} />
                  <span className="flex-1">{tab.label}</span>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-cyan-400" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Settings Cards Pane */}
        <div className="md:col-span-3 space-y-4">
          
          {/* TAB 1: ACCOUNT */}
          {activeTab === "account" && (
            <div className="p-5 rounded-2xl bg-[#0A101E]/90 border border-white/10 space-y-5 shadow-lg">
              <div>
                <h3 className="font-space font-bold text-base text-white">
                  Profile Details & Security
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Your personal identity and security credentials.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Your Name
                  </label>
                  <input
                    type="text"
                    disabled={!isSignedIn}
                    placeholder={isSignedIn ? "e.g. Indrajit Kumar" : "Not signed in - Click to login"}
                    value={isSignedIn ? (user?.fullName || settings.displayName) : ""}
                    onChange={(e) =>
                      setSettings({ ...settings, displayName: e.target.value })
                    }
                    onClick={() => {
                      if (!isSignedIn) openSignIn();
                    }}
                    className="w-full bg-[#0D1424] border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400/50 disabled:opacity-60 disabled:cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    disabled={!isSignedIn}
                    placeholder={isSignedIn ? "your.email@quant.com" : "Not signed in - Click to login"}
                    value={isSignedIn ? (user?.email || settings.email) : ""}
                    onChange={(e) =>
                      setSettings({ ...settings, email: e.target.value })
                    }
                    onClick={() => {
                      if (!isSignedIn) openSignIn();
                    }}
                    className="w-full bg-[#0D1424] border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400/50 disabled:opacity-60 disabled:cursor-pointer"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Profile Avatar Picture URL (Gmail / Google / Custom Photo)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      disabled={!isSignedIn}
                      placeholder={isSignedIn ? "https://lh3.googleusercontent.com/..." : "Not signed in - Click to login"}
                      value={user?.imageUrl || ""}
                      onChange={(e) => {
                        setSettingsImgError(false);
                        updateUser({ imageUrl: e.target.value });
                      }}
                      className="flex-1 bg-[#0D1424] border border-white/10 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400/50 disabled:opacity-60 font-mono"
                    />
                    {isSignedIn && (
                      <button
                        type="button"
                        onClick={() => {
                          setSettingsImgError(false);
                          const resolvedPhoto =
                            clerkUser?.imageUrl ||
                            `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.fullName || "User")}&backgroundColor=00f0ff,4f46e5&textColor=ffffff`;
                          updateUser({ imageUrl: resolvedPhoto });
                          handleSave();
                        }}
                        className="px-3 py-1.5 rounded-xl border border-cyan-500/30 bg-cyan-950/20 hover:bg-cyan-900/30 text-cyan-300 text-xs font-semibold whitespace-nowrap cursor-pointer transition-all"
                      >
                        Reset to Google Photo
                      </button>
                    )}
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                    <span>Terminal Language / भाषा</span>
                    <span className="text-[10px] text-cyan-400 font-mono font-bold">Multi-Lingual i18n</span>
                  </label>
                  <select
                    value={settings.language}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        language: e.target.value as AppSettings["language"],
                      })
                    }
                    className="w-full bg-[#0D1424] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-400/50 font-space cursor-pointer"
                  >
                    <option value="hinglish">🇮🇳 Hinglish (English + Hindi)</option>
                    <option value="hi">🇮🇳 हिन्दी (Hindi - भारत)</option>
                    <option value="en">🇺🇸 English (Global / US)</option>
                    <option value="en-IN">🇮🇳 English (India - ₹ Lakhs / Crores)</option>
                    <option value="es">🇪🇸 Español (Spanish)</option>
                    <option value="ja">🇯🇵 日本語 (Japanese)</option>
                    <option value="de">🇩🇪 Deutsch (German)</option>
                  </select>
                </div>
              </div>

              <div className="border-t border-white/5 pt-3">
                <ToggleSwitch
                  checked={settings.twoFactorAuth}
                  onChange={(val) =>
                    setSettings({ ...settings, twoFactorAuth: val })
                  }
                  label="Two-Factor Authentication (2FA)"
                  description="Secure your trading terminal with an extra layer of biometric or code security."
                />
              </div>

              {/* Save Settings Button (Right below 2FA) */}
              <div className="border-t border-white/5 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <p className="text-[11px] text-slate-400 hidden sm:block">
                  Changes to your account & security are applied immediately.
                </p>
                <button
                  onClick={handleSave}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black font-space font-bold text-xs sm:text-sm shadow-[0_0_20px_rgba(0,240,255,0.4)] hover:shadow-[0_0_25px_rgba(0,240,255,0.6)] active:scale-95 transition-all cursor-pointer"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Save Settings</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: NOTIFICATIONS */}
          {activeTab === "notifications" && (
            <div className="p-5 rounded-2xl bg-[#0A101E]/90 border border-white/10 space-y-4 shadow-lg">
              <div>
                <h3 className="font-space font-bold text-base text-white">
                  Alerts & Notifications
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Choose what events you want to be notified about on your phone and laptop.
                </p>
              </div>

              <div className="space-y-1 divide-y divide-white/5">
                <ToggleSwitch
                  checked={settings.marketAlerts}
                  onChange={(val) =>
                    setSettings({ ...settings, marketAlerts: val })
                  }
                  label="Market Breakout Alerts"
                  description="Get notified when NIFTY, S&P 500, or your watchlist stocks make sudden high-volume moves."
                />

                <ToggleSwitch
                  checked={settings.dailyBriefing}
                  onChange={(val) =>
                    setSettings({ ...settings, dailyBriefing: val })
                  }
                  label="Daily Morning Market Brief"
                  description="Receive an institutional summary every morning at 8:45 AM before markets open."
                />

                <ToggleSwitch
                  checked={settings.alertSound}
                  onChange={(val) => {
                    setSettings({ ...settings, alertSound: val });
                    if (val) playAlertChime(880, 0.08);
                  }}
                  label="Alert Audio Chime"
                  description="Play a subtle Bloomberg chime when an institutional breakout setup is detected."
                />

                <ToggleSwitch
                  checked={settings.telegramAlerts}
                  onChange={(val) =>
                    setSettings({ ...settings, telegramAlerts: val })
                  }
                  label="Telegram Trading Channel Bot"
                  description="Forward live high-confidence signals directly into your private Telegram."
                />
              </div>

              {/* Save Settings Button */}
              <div className="border-t border-white/5 pt-4 flex justify-end">
                <button
                  onClick={handleSave}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black font-space font-bold text-xs sm:text-sm shadow-[0_0_20px_rgba(0,240,255,0.4)] hover:shadow-[0_0_25px_rgba(0,240,255,0.6)] active:scale-95 transition-all cursor-pointer"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Save Settings</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: TRADING PREFERENCES */}
          {activeTab === "trading" && (
            <div className="p-5 rounded-2xl bg-[#0A101E]/90 border border-white/10 space-y-5 shadow-lg">
              <div>
                <h3 className="font-space font-bold text-base text-white">
                  Trading & Market Setup
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Customize your currency format, primary market index, and quote refresh speeds.
                </p>
              </div>

              {/* Currency Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Display Currency
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {[
                    { id: "INR", label: "₹ INR", sub: "Indian Rupee" },
                    { id: "USD", label: "$ USD", sub: "US Dollar" },
                    { id: "EUR", label: "€ EUR", sub: "Euro" },
                  ].map((curr) => (
                    <button
                      key={curr.id}
                      onClick={() =>
                        setSettings({
                          ...settings,
                          currency: curr.id as "INR" | "USD" | "EUR",
                        })
                      }
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                        settings.currency === curr.id
                          ? "bg-cyan-500/15 border-cyan-400 text-white shadow-md shadow-cyan-950/40"
                          : "bg-[#0D1424] border-white/5 text-slate-400 hover:text-white hover:border-white/20"
                      }`}
                    >
                      <div className="font-space font-bold text-sm text-cyan-300">
                        {curr.label}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {curr.sub}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Primary Market Index */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Primary Market Index
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {["NIFTY 50", "BANKNIFTY", "S&P 500", "NASDAQ 100", "SENSEX"].map(
                    (idx) => (
                      <button
                        key={idx}
                        onClick={() =>
                          setSettings({
                            ...settings,
                            primaryIndex: idx as AppSettings["primaryIndex"],
                          })
                        }
                        className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                          settings.primaryIndex === idx
                            ? "bg-cyan-500/15 border-cyan-400 text-white shadow-md shadow-cyan-950/40"
                            : "bg-[#0D1424] border-white/5 text-slate-400 hover:text-white hover:border-white/20"
                        }`}
                      >
                        <div className="font-space font-bold text-xs sm:text-sm text-white">
                          {idx}
                        </div>
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Data Refresh Speed */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Live Data Refresh Frequency
                </label>
                <select
                  value={settings.refreshSpeed}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      refreshSpeed: e.target.value as AppSettings["refreshSpeed"],
                    })
                  }
                  className="w-full bg-[#0D1424] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-400/50"
                >
                  <option value="5s">⚡ Ultra Fast (Every 5 Seconds - Day Trading)</option>
                  <option value="15s">⚖️ Normal (Every 15 Seconds - Recommended)</option>
                  <option value="60s">🌱 Battery Saver (Every 60 Seconds - Mobile)</option>
                </select>
              </div>

              {/* Save Settings Button */}
              <div className="border-t border-white/5 pt-4 flex justify-end">
                <button
                  onClick={handleSave}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black font-space font-bold text-xs sm:text-sm shadow-[0_0_20px_rgba(0,240,255,0.4)] hover:shadow-[0_0_25px_rgba(0,240,255,0.6)] active:scale-95 transition-all cursor-pointer"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Save Settings</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: AI COPILOT */}
          {activeTab === "copilot" && (
            <div className="p-5 rounded-2xl bg-[#0A101E]/90 border border-white/10 space-y-5 shadow-lg">
              <div>
                <h3 className="font-space font-bold text-base text-white">
                  MarketMind Copilot AI Setup
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Tune how your personal AI copilot analyzes setups and communicates.
                </p>
              </div>

              {/* AI Response Style */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  AI Communication Style
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={() =>
                      setSettings({ ...settings, aiStyle: "concise" })
                    }
                    className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                      settings.aiStyle === "concise"
                        ? "bg-cyan-500/15 border-cyan-400 text-white shadow-md shadow-cyan-950/40"
                        : "bg-[#0D1424] border-white/5 text-slate-400 hover:text-white"
                    }`}
                  >
                    <div className="font-space font-bold text-sm text-cyan-300 flex items-center gap-1.5">
                      ⚡ Concise & Clear
                    </div>
                    <div className="text-xs text-slate-400 mt-1 leading-relaxed">
                      Short, easy-to-read takeaways with clear bull/bear conclusions.
                    </div>
                  </button>

                  <button
                    onClick={() =>
                      setSettings({ ...settings, aiStyle: "deep" })
                    }
                    className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                      settings.aiStyle === "deep"
                        ? "bg-cyan-500/15 border-cyan-400 text-white shadow-md shadow-cyan-950/40"
                        : "bg-[#0D1424] border-white/5 text-slate-400 hover:text-white"
                    }`}
                  >
                    <div className="font-space font-bold text-sm text-cyan-300 flex items-center gap-1.5">
                      🧠 Deep Quantitative Tear-Sheet
                    </div>
                    <div className="text-xs text-slate-400 mt-1 leading-relaxed">
                      Complete multi-factor metrics, options IV skew, and risk scenarios.
                    </div>
                  </button>
                </div>
              </div>

              {/* Toggles */}
              <div className="space-y-1 divide-y divide-white/5 border-t border-white/5 pt-2">
                <ToggleSwitch
                  checked={settings.aiAutoAnalysis}
                  onChange={(val) =>
                    setSettings({ ...settings, aiAutoAnalysis: val })
                  }
                  label="Continuous Market Scanning"
                  description="Allow Copilot to monitor institutional liquidity and notify you of breakout patterns."
                />

                <ToggleSwitch
                  checked={settings.aiTradingAlerts}
                  onChange={(val) =>
                    setSettings({ ...settings, aiTradingAlerts: val })
                  }
                  label="Risk-Hedged Signal Suggestions"
                  description="Proactively suggest potential stop-loss and take-profit levels."
                />
              </div>

              {/* Dynamic Live Behavior Preview */}
              <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-1.5">
                  <span className="text-xs font-bold text-cyan-300 font-space flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    Live Copilot Behavior Preview
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 flex items-center gap-2 flex-wrap">
                    <span>Mode: <strong className="text-white">{settings.aiStyle.toUpperCase()}</strong></span>
                    <span>Radar: <strong className={settings.aiAutoAnalysis ? "text-emerald-400" : "text-slate-500"}>{settings.aiAutoAnalysis ? "ON" : "OFF"}</strong></span>
                    <span>Signals: <strong className={settings.aiTradingAlerts ? "text-indigo-400" : "text-slate-500"}>{settings.aiTradingAlerts ? "ON" : "OFF"}</strong></span>
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-[#070B14] border border-white/5 font-mono text-[11px] text-slate-300 space-y-1.5 leading-relaxed">
                  <div className="text-cyan-400 font-semibold">
                    Q: "NIFTY 50 trend analyze karein"
                  </div>
                  {settings.aiStyle === "concise" ? (
                    <div className="space-y-1">
                      <div>• <strong>Current Trend:</strong> Bullish consolidation above 50-SMA (23,450 floor).</div>
                      <div>• <strong>Market Verdict:</strong> Accumulate on dips; avoid chasing breakout highs.</div>
                      {settings.aiTradingAlerts && (
                        <div className="text-indigo-300">• 🎯 <strong>Hedged Levels:</strong> Entry 23,460–23,490 | SL: 23,380 (-0.8%) | Target: 23,880</div>
                      )}
                      <div className="text-[10px] text-slate-500 italic mt-1">*⚡ Tactical Concise Mode active*</div>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <div>• <strong>1. Benchmark Posture:</strong> Consolidating above 50-day SMA corridor (23,450 floor). Composite Fear & Greed Index at 50/100 Neutral.</div>
                      <div>• <strong>2. Smart Money Vector:</strong> DIIs daily cash equity me +₹2,400+ Cr net buyers; leadership IT & Auto me.</div>
                      {settings.aiAutoAnalysis && (
                        <div className="text-emerald-300 pt-0.5">• 📡 <strong>Continuous Radar:</strong> Sub-second order book tracking detects institutional Put writing defending 23,450 support.</div>
                      )}
                      {settings.aiTradingAlerts ? (
                        <div className="text-indigo-300 pt-0.5">• 🎯 <strong>Hedged Trade Setup:</strong> Accumulate 23,460–23,490 | SL: 23,380 | T1: 23,720 | T2: 23,880 (1:2.4 RR)</div>
                      ) : (
                        <div className="text-slate-500 pt-0.5 text-[10px]">• 🎯 <em>Hedged Signal Suggestions disabled in settings</em></div>
                      )}
                      <div className="text-[10px] text-slate-500 italic mt-1">*🔬 Deep Quantitative Tear-Sheet Mode active*</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Save Settings Button */}
              <div className="border-t border-white/5 pt-4 flex justify-end">
                <button
                  onClick={handleSave}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black font-space font-bold text-xs sm:text-sm shadow-[0_0_20px_rgba(0,240,255,0.4)] hover:shadow-[0_0_25px_rgba(0,240,255,0.6)] active:scale-95 transition-all cursor-pointer"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Save Settings</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 5: APPEARANCE */}
          {activeTab === "appearance" && (
            <div className="p-5 rounded-2xl bg-[#0A101E]/90 border border-white/10 space-y-5 shadow-lg">
              <div>
                <h3 className="font-space font-bold text-base text-white">
                  Appearance & Visual Theme
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Customize how Indra-MarketMind looks on your phone, tablet, and laptop.
                </p>
              </div>

              {/* Themes */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold text-slate-300">
                    Theme Palette (थीम मोड)
                  </label>
                  {settings.theme === "system" && (
                    <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/40 border border-cyan-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      System Active: Device is in {activeTheme === "dark" ? "Dark" : "Bright"} Mode
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    {
                      id: "dark",
                      name: "Dark Mode (Default)",
                      icon: Moon,
                      color: "#05070D",
                      badge: "Current OLED Terminal",
                      desc: "Current terminal look, deep blacks & neon electric cyan accents",
                    },
                    {
                      id: "bright",
                      name: "Bright Mode",
                      icon: Sun,
                      color: "#FFFFFF",
                      badge: "Clean Light Terminal",
                      desc: "High-visibility clean white background with crisp dark slate text",
                    },
                    {
                      id: "system",
                      name: "System Auto (Phone Adaptive)",
                      icon: Smartphone,
                      color: "linear-gradient(135deg, #05070D 50%, #FFFFFF 50%)",
                      badge: "Sync with Device OS",
                      desc: "Automatically adapts to your phone or laptop's light/dark setting",
                    },
                  ].map((theme) => {
                    const Icon = theme.icon;
                    const isSelected =
                      settings.theme === theme.id ||
                      (theme.id === "dark" &&
                        (settings.theme === "oled" ||
                          settings.theme === "midnight" ||
                          settings.theme === "emerald"));

                    return (
                      <button
                        key={theme.id}
                        onClick={() =>
                          setSettings({
                            ...settings,
                            theme: theme.id as AppSettings["theme"],
                          })
                        }
                        className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all relative overflow-hidden group ${
                          isSelected
                            ? "bg-cyan-500/15 border-cyan-400 shadow-lg shadow-cyan-950/40"
                            : "bg-[#0D1424] border-white/5 hover:border-white/20 hover:bg-[#111A2E]"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2.5">
                          <div
                            className="w-7 h-7 rounded-lg border border-white/20 flex items-center justify-center shadow-inner"
                            style={{ background: theme.color }}
                          >
                            <Icon
                              className={`w-3.5 h-3.5 ${
                                theme.id === "bright"
                                  ? "text-slate-800"
                                  : "text-cyan-300"
                              }`}
                            />
                          </div>
                          {isSelected && (
                            <span className="w-5 h-5 rounded-full bg-cyan-400 text-black flex items-center justify-center shadow-[0_0_8px_rgba(0,240,255,0.6)]">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </span>
                          )}
                        </div>
                        <div className="font-space font-bold text-xs text-white group-hover:text-cyan-300 transition-colors">
                          {theme.name}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                          {theme.desc}
                        </div>
                        <div className="mt-2 text-[9px] font-mono font-medium text-cyan-400/90 flex items-center gap-1">
                          <span>{theme.badge}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Interface & System Language */}
              <div className="border-t border-white/5 pt-4">
                <div className="flex items-center justify-between mb-2.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300">
                      Interface & Terminal Language (भाषा)
                    </label>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Select your preferred language for tickers, navigation, and quantitative alerts.
                    </p>
                  </div>
                  <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-500/30 px-2.5 py-0.5 rounded-full font-bold">
                    Multi-Lingual
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {[
                    { id: "en", name: "English (US)", sub: "Global English", flag: "🇺🇸" },
                    { id: "hinglish", name: "Hinglish", sub: "Hindi in English Script", flag: "🇮🇳" },
                    { id: "hi", name: "हिन्दी (Hindi)", sub: "भारत (Devanagari)", flag: "🇮🇳" },
                    { id: "en-IN", name: "English (India)", sub: "₹ Lakhs/Crores", flag: "🇮🇳" },
                    { id: "es", name: "Español", sub: "Spanish Markets", flag: "🇪🇸" },
                    { id: "ja", name: "日本語", sub: "Tokyo Session", flag: "🇯🇵" },
                    { id: "de", name: "Deutsch", sub: "Frankfurt Session", flag: "🇩🇪" },
                  ].map((lang) => (
                    <button
                      key={lang.id}
                      onClick={() =>
                        setSettings({
                          ...settings,
                          language: lang.id as AppSettings["language"],
                        })
                      }
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                        settings.language === lang.id
                          ? "bg-cyan-500/15 border-cyan-400 text-white shadow-md shadow-cyan-950/40"
                          : "bg-[#0D1424] border-white/5 text-slate-400 hover:text-white hover:border-white/20"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base">{lang.flag}</span>
                        <span className="font-space font-bold text-xs sm:text-sm text-white">
                          {lang.name}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1 pl-6">
                        {lang.sub}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Table Density */}
              <div className="border-t border-white/5 pt-4">
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Data Table Layout Density
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() =>
                      setSettings({ ...settings, tableDensity: "comfortable" })
                    }
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      settings.tableDensity === "comfortable"
                        ? "bg-cyan-500/15 border-cyan-400 text-white"
                        : "bg-[#0D1424] border-white/5 text-slate-400"
                    }`}
                  >
                    <div className="font-semibold text-xs text-white">Spacious & Comfortable</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">Generous spacing, easy to read on mobile</div>
                  </button>

                  <button
                    onClick={() =>
                      setSettings({ ...settings, tableDensity: "compact" })
                    }
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      settings.tableDensity === "compact"
                        ? "bg-cyan-500/15 border-cyan-400 text-white"
                        : "bg-[#0D1424] border-white/5 text-slate-400"
                    }`}
                  >
                    <div className="font-semibold text-xs text-white">High Density Compact</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">More stocks visible on laptop screen</div>
                  </button>
                </div>
              </div>

              {/* Save Settings Button */}
              <div className="border-t border-white/5 pt-4 flex justify-end">
                <button
                  onClick={handleSave}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black font-space font-bold text-xs sm:text-sm shadow-[0_0_20px_rgba(0,240,255,0.4)] hover:shadow-[0_0_25px_rgba(0,240,255,0.6)] active:scale-95 transition-all cursor-pointer"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Save Settings</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 6: ABOUT & STORAGE */}
          {activeTab === "about" && (
            <div className="p-5 rounded-2xl bg-[#0A101E]/90 border border-white/10 space-y-5 shadow-lg">
              <div>
                <h3 className="font-space font-bold text-base text-white">
                  About Indra-MarketMind & Storage
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Application version, creator credits, and local storage management.
                </p>
              </div>

              {/* App Specs Card */}
              <div className="p-4 rounded-xl bg-[#0D1424] border border-white/5 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-300">
                  <span>Platform Edition:</span>
                  <span className="font-space font-bold text-white">Indra-MarketMind V3.0 (Hedge Fund Edition)</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span>Created By:</span>
                  <span className="font-space font-bold text-cyan-300">Indrajit Kumar</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span>PWA App Status:</span>
                  <span className="font-mono text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    Universal App Active
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span>Offline Storage:</span>
                  <span className="font-mono text-slate-300">{cacheSize} cached</span>
                </div>
                <div className="flex items-center justify-between text-slate-300 pt-1 border-t border-white/5">
                  <span>Top Navbar "Get App" Button:</span>
                  <span className="font-mono text-cyan-300">
                    {isAppDownloadedOrInstalled ? "Hidden (App Active)" : "Visible in Header"}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {isAppDownloadedOrInstalled ? (
                  <button
                    onClick={resetAppDownloadedStatus}
                    className="flex items-center justify-center gap-2 p-3 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-semibold cursor-pointer transition-all"
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>Re-show "Get App" in Navbar</span>
                  </button>
                ) : (
                  <button
                    onClick={markAppAsDownloaded}
                    className="flex items-center justify-center gap-2 p-3 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-semibold cursor-pointer transition-all"
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>Hide "Get App" from Navbar</span>
                  </button>
                )}

                <button
                  onClick={handleClearCache}
                  className="flex items-center justify-center gap-2 p-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold cursor-pointer transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Clear App Cache & Data</span>
                </button>

                <button
                  onClick={handleExport}
                  className="flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 text-xs font-semibold cursor-pointer transition-all sm:col-span-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Backup (JSON)</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
