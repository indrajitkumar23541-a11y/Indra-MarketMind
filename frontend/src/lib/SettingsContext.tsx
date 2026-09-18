"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { translate, speakText, LanguageCode } from "./i18n";

export type ThemeMode = "dark" | "bright" | "system" | "oled" | "midnight" | "emerald";

export interface AppSettings {
  // Account
  displayName: string;
  email: string;
  twoFactorAuth: boolean;
  language: LanguageCode;

  // Notifications
  marketAlerts: boolean;
  dailyBriefing: boolean;
  alertSound: boolean;
  telegramAlerts: boolean;

  // Trading Preferences
  currency: "INR" | "USD" | "EUR";
  primaryIndex: "NIFTY 50" | "BANKNIFTY" | "S&P 500" | "NASDAQ 100" | "SENSEX";
  refreshSpeed: "5s" | "15s" | "60s";

  // AI Copilot
  aiStyle: "concise" | "deep";
  aiAutoAnalysis: boolean;
  aiTradingAlerts: boolean;
  aiFrequency: "realtime" | "daily";

  // Appearance
  theme: ThemeMode;
  accentColor: "cyan" | "blue" | "emerald";
  tableDensity: "comfortable" | "compact";
}

export const DEFAULT_SETTINGS: AppSettings = {
  displayName: "",
  email: "",
  twoFactorAuth: true,
  language: "en",

  marketAlerts: true,
  dailyBriefing: true,
  alertSound: true,
  telegramAlerts: false,

  currency: "INR",
  primaryIndex: "NIFTY 50",
  refreshSpeed: "15s",

  aiStyle: "deep",
  aiAutoAnalysis: true,
  aiTradingAlerts: true,
  aiFrequency: "realtime",

  theme: "dark",
  accentColor: "cyan",
  tableDensity: "comfortable",
};

interface SettingsContextType {
  settings: AppSettings;
  activeTheme: "dark" | "bright";
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  saveSettings: () => void;
  resetSettings: () => void;
  formatCurrency: (val: number, options?: { from?: "USD" | "INR" | "EUR"; raw?: boolean; compact?: boolean }) => string;
  currencySymbol: string;
  refreshIntervalMs: number;
  t: (key: string) => string;
  playAlertChime: (freq?: number, duration?: number) => void;
  speakAlert: (text: string) => void;
  dispatchNotification: (title: string, body: string) => void;
  tableDensityClass: string;
  exportSettingsJson: () => void;
  clearAppStorage: () => Promise<void>;
  isLoaded: boolean;
}

const SettingsContext = createContext<SettingsContextType | null>(null);

const STORAGE_KEY = "indra_settings_v3";

// Real USD conversion baselines
const RATES: Record<"INR" | "USD" | "EUR", number> = {
  USD: 1.0,
  INR: 86.5,
  EUR: 0.92,
};

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);
  const [systemPrefersDark, setSystemPrefersDark] = useState<boolean>(true);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.displayName === "Indrajit Kumar") parsed.displayName = "";
        if (parsed.email === "indrajit.quant@marketmind.ai") parsed.email = "";
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
      }
    } catch (e) {
      console.warn("Failed to parse settings from storage", e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Listen to phone/device OS theme preferences (prefers-color-scheme)
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    setSystemPrefersDark(media.matches);

    const listener = (e: MediaQueryListEvent) => {
      setSystemPrefersDark(e.matches);
    };
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, []);

  // Compute resolved active theme
  const activeTheme: "dark" | "bright" = useMemo(() => {
    if (settings.theme === "system") {
      return systemPrefersDark ? "dark" : "bright";
    }
    if (settings.theme === "bright") {
      return "bright";
    }
    // "dark", "oled", "midnight", "emerald" all resolve to dark
    return "dark";
  }, [settings.theme, systemPrefersDark]);

  // Synchronize CSS theme class dynamically to html/body
  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    root.classList.remove("theme-dark", "theme-bright", "theme-oled", "theme-midnight", "theme-emerald");
    root.classList.add(`theme-${activeTheme}`);

    // Set background color according to resolved theme
    if (activeTheme === "bright") {
      document.body.style.backgroundColor = "#F1F5F9";
    } else {
      document.body.style.backgroundColor = "#05070D";
    }
  }, [activeTheme]);

  // Update Settings
  const updateSettings = useCallback((partial: Partial<AppSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...partial };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (err) {
        console.error("Failed to save settings", err);
      }
      return updated;
    });
  }, []);

  const saveSettings = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (err) {
      console.error("Failed to save settings", err);
    }
  }, [settings]);

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SETTINGS));
    } catch (err) {
      console.error("Failed to reset settings", err);
    }
  }, []);

  // Currency Formatter: takes value and formats to target currency
  const formatCurrency = useCallback(
    (amount: number, options?: { from?: "USD" | "INR" | "EUR"; raw?: boolean; compact?: boolean }): string => {
      if (isNaN(amount) || amount === null || amount === undefined) return "—";
      
      const fromCurr = options?.from || "USD";
      const usdBase = fromCurr === "USD" ? amount : amount / (RATES[fromCurr] || 1);
      const targetRate = RATES[settings.currency] || 1;
      const converted = usdBase * targetRate;
      const isCompact = options?.compact ?? false;

      if (options?.raw) {
        return converted.toFixed(2);
      }

      if (settings.currency === "INR") {
        if (isCompact) {
          if (Math.abs(converted) >= 10000000) {
            return `₹ ${(converted / 10000000).toFixed(2)} Cr`;
          }
          if (Math.abs(converted) >= 100000) {
            return `₹ ${(converted / 100000).toFixed(2)} L`;
          }
        }
        return `₹ ${converted.toLocaleString("en-IN", {
          maximumFractionDigits: 2,
          minimumFractionDigits: 2,
        })}`;
      }

      if (settings.currency === "EUR") {
        if (isCompact) {
          if (Math.abs(converted) >= 1000000000) {
            return `€ ${(converted / 1000000000).toFixed(2)} B`;
          }
          if (Math.abs(converted) >= 1000000) {
            return `€ ${(converted / 1000000).toFixed(2)} M`;
          }
        }
        return `€ ${converted.toLocaleString("de-DE", {
          maximumFractionDigits: 2,
          minimumFractionDigits: 2,
        })}`;
      }

      // Default USD
      if (isCompact) {
        if (Math.abs(converted) >= 1000000000) {
          return `$ ${(converted / 1000000000).toFixed(2)} B`;
        }
        if (Math.abs(converted) >= 1000000) {
          return `$ ${(converted / 1000000).toFixed(2)} M`;
        }
      }
      return `$ ${converted.toLocaleString("en-US", {
        maximumFractionDigits: 2,
        minimumFractionDigits: 2,
      })}`;
    },
    [settings.currency]
  );

  const currencySymbol = settings.currency === "INR" ? "₹" : settings.currency === "EUR" ? "€" : "$";

  // Streaming Interval in Milliseconds
  const refreshIntervalMs =
    settings.refreshSpeed === "5s"
      ? 5000
      : settings.refreshSpeed === "60s"
      ? 60000
      : 15000;

  // Translation Helper
  const t = useCallback(
    (key: string) => {
      return translate(key, settings.language);
    },
    [settings.language]
  );

  // Audio Chime Player
  const playAlertChime = useCallback(
    (freq = 880, duration = 0.08) => {
      if (!settings.alertSound || typeof window === "undefined") return;
      try {
        const audioCtx = new (window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.06, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + duration);
      } catch {
        // Ignore audio issues in restricted browsers
      }
    },
    [settings.alertSound]
  );

  // Native Text-to-Speech Alert Speaker (in user's selected language)
  const speakAlert = useCallback(
    (text: string) => {
      if (!settings.alertSound || typeof window === "undefined") return;
      playAlertChime(880, 0.08);
      setTimeout(() => {
        speakText(text, settings.language);
      }, 100);
    },
    [settings.alertSound, settings.language, playAlertChime]
  );

  // Browser Notification Dispatcher
  const dispatchNotification = useCallback(
    (title: string, body: string) => {
      if (!settings.marketAlerts || typeof window === "undefined") return;
      if (!("Notification" in window)) return;

      if (Notification.permission === "granted") {
        new Notification(title, {
          body,
          icon: "/icons/icon-192x192.png",
        });
      } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then((permission) => {
          if (permission === "granted") {
            new Notification(title, {
              body,
              icon: "/icons/icon-192x192.png",
            });
          }
        });
      }
    },
    [settings.marketAlerts]
  );

  // Table Density Class Helper
  const tableDensityClass =
    settings.tableDensity === "compact"
      ? "py-1.5 px-2.5 text-xs"
      : "py-3 px-4 text-sm";

  // Export Settings as JSON
  const exportSettingsJson = useCallback(() => {
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(
        JSON.stringify(
          {
            app: "Indra-MarketMind",
            version: "3.0 Pro",
            user: settings.displayName,
            savedAt: new Date().toISOString(),
            settings,
          },
          null,
          2
        )
      );
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `marketmind_settings_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }, [settings]);

  // Clear App Cache & Local State
  const clearAppStorage = useCallback(async () => {
    if (typeof window !== "undefined") {
      if ("caches" in window) {
        const names = await caches.keys();
        await Promise.all(names.map((name) => caches.delete(name)));
      }
      sessionStorage.clear();
      // Keep only settings, clear the rest
      const saved = localStorage.getItem(STORAGE_KEY);
      localStorage.clear();
      if (saved) localStorage.setItem(STORAGE_KEY, saved);
    }
  }, []);

  return (
    <SettingsContext.Provider
      value={{
        settings,
        activeTheme,
        updateSettings,
        saveSettings,
        resetSettings,
        formatCurrency,
        currencySymbol,
        refreshIntervalMs,
        t,
        playAlertChime,
        speakAlert,
        dispatchNotification,
        tableDensityClass,
        exportSettingsJson,
        clearAppStorage,
        isLoaded,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return ctx;
}
