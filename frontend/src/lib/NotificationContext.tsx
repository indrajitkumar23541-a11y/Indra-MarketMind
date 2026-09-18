"use client";

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import { useSettings } from "./SettingsContext";

export interface LiveNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  timestamp: number;
  type: "bullish" | "bearish" | "neutral" | "breaking";
  read: boolean;
  source?: string;
  url?: string;
  category?: string;
}

interface NotificationContextType {
  notifications: LiveNotification[];
  unreadCount: number;
  activeToast: LiveNotification | null;
  pushPermission: NotificationPermission | "unsupported";
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
  dismissToast: () => void;
  requestPushPermission: () => Promise<boolean>;
  triggerTestNotification: () => void;
  addNotification: (item: {
    title: string;
    message: string;
    type?: "bullish" | "bearish" | "neutral" | "breaking";
    source?: string;
    url?: string;
    category?: string;
  }) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const NOTIF_STORAGE_KEY = "indra_live_notifications_v3";
const SEEN_NEWS_KEY = "indra_seen_news_ids_v3";
const LAST_ALERT_TIME_KEY = "indra_last_alert_timestamps";

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { playAlertChime, settings } = useSettings();

  // Notifications list (NO hardcoded default items)
  const [notifications, setNotifications] = useState<LiveNotification[]>([]);
  const [activeToast, setActiveToast] = useState<LiveNotification | null>(null);
  const [pushPermission, setPushPermission] = useState<NotificationPermission | "unsupported">("default");

  const seenNewsRef = useRef<Set<string>>(new Set());
  const lastIndexAlertRef = useRef<Record<string, number>>({});
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize from localStorage and check notification permission
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Load saved notifications
    try {
      const saved = localStorage.getItem(NOTIF_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setNotifications(parsed);
        }
      }
    } catch {
      // ignore
    }

    // Load seen news IDs
    try {
      const savedSeen = localStorage.getItem(SEEN_NEWS_KEY);
      if (savedSeen) {
        const parsed = JSON.parse(savedSeen);
        if (Array.isArray(parsed)) {
          seenNewsRef.current = new Set(parsed);
        }
      }
    } catch {
      // ignore
    }

    // Check browser notification permission
    if ("Notification" in window) {
      setPushPermission(Notification.permission);
    } else {
      setPushPermission("unsupported");
    }
  }, []);

  // Save notifications to localStorage whenever changed
  const persistNotifications = useCallback((items: LiveNotification[]) => {
    try {
      localStorage.setItem(NOTIF_STORAGE_KEY, JSON.stringify(items.slice(0, 50)));
    } catch {
      // ignore
    }
  }, []);

  // Request native OS / Browser push notifications permission
  const requestPushPermission = useCallback(async (): Promise<boolean> => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      return false;
    }
    try {
      const perm = await Notification.requestPermission();
      setPushPermission(perm);
      return perm === "granted";
    } catch {
      return false;
    }
  }, []);

  // Dispatch floating toast and play audio chime
  const showToast = useCallback(
    (item: LiveNotification) => {
      setActiveToast(item);

      // Play alert chime if enabled in settings
      if (settings.alertSound) {
        try {
          playAlertChime(item.type === "bearish" ? 640 : 880, 0.12);
        } catch {
          // ignore
        }
      }

      // Dispatch native browser notification if user allowed
      if (
        typeof window !== "undefined" &&
        "Notification" in window &&
        Notification.permission === "granted" &&
        settings.marketAlerts
      ) {
        try {
          new Notification(item.title, {
            body: item.message,
            icon: "/icons/icon-192x192.png",
          });
        } catch {
          // ignore
        }
      }

      // Auto dismiss floating toast in 6 seconds
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
      toastTimeoutRef.current = setTimeout(() => {
        setActiveToast(null);
      }, 6500);
    },
    [settings.alertSound, settings.marketAlerts, playAlertChime]
  );

  const dismissToast = useCallback(() => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setActiveToast(null);
  }, []);

  // Add a new live notification
  const addNotification = useCallback(
    ({
      title,
      message,
      type = "neutral",
      source,
      url,
      category,
    }: {
      title: string;
      message: string;
      type?: "bullish" | "bearish" | "neutral" | "breaking";
      source?: string;
      url?: string;
      category?: string;
    }) => {
      const newItem: LiveNotification = {
        id: "notif_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6),
        title,
        message,
        time: "Just now",
        timestamp: Date.now(),
        type,
        read: false,
        source,
        url,
        category,
      };

      setNotifications((prev) => {
        const updated = [newItem, ...prev.filter((p) => p.title !== title)].slice(0, 40);
        persistNotifications(updated);
        return updated;
      });

      showToast(newItem);
    },
    [persistNotifications, showToast]
  );

  // Mark single as read
  const markAsRead = useCallback(
    (id: string) => {
      setNotifications((prev) => {
        const updated = prev.map((n) => (n.id === id ? { ...n, read: true } : n));
        persistNotifications(updated);
        return updated;
      });
    },
    [persistNotifications]
  );

  // Mark all as read
  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => {
      const updated = prev.map((n) => ({ ...n, read: true }));
      persistNotifications(updated);
      return updated;
    });
  }, [persistNotifications]);

  // Clear all notifications
  const clearAll = useCallback(() => {
    setNotifications([]);
    try {
      localStorage.removeItem(NOTIF_STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  // Trigger immediate test notification for user verification
  const triggerTestNotification = useCallback(() => {
    addNotification({
      title: "🚨 BREAKING: Reserve Bank of India Policy Update",
      message: "Monetary Policy Committee retains benchmark repo rate at 6.50% with neutral policy stance.",
      type: "bullish",
      source: "Economic Times",
      url: "/live-feed",
      category: "Macro",
    });
  }, [addNotification]);

  // Real-Time Background Market & News Polling Worker (Runs every 18 seconds)
  useEffect(() => {
    let isMounted = true;

    const pollMarketAndNews = async () => {
      if (!isMounted) return;

      try {
        // 1. Fetch live news stories
        const newsRes = await fetch("/api/data/news/live-feed?limit=8");
        if (newsRes.ok) {
          const data = await newsRes.json();
          const articles = data.articles || [];

          for (const article of articles) {
            const articleId = String(article.id || article.title);

            // If new article we haven't notified yet
            if (!seenNewsRef.current.has(articleId)) {
              seenNewsRef.current.add(articleId);

              // Persist seen IDs
              try {
                localStorage.setItem(
                  SEEN_NEWS_KEY,
                  JSON.stringify(Array.from(seenNewsRef.current).slice(-100))
                );
              } catch {}

              const sentimentType =
                article.sentiment === "Bullish"
                  ? "bullish"
                  : article.sentiment === "Bearish"
                  ? "bearish"
                  : "neutral";

              addNotification({
                title: `🚨 ${article.source || "Breaking"}: ${article.title}`,
                message: article.content ? article.content.split("\n")[0].slice(0, 140) + "..." : "New financial market intelligence update available.",
                type: sentimentType,
                source: article.source,
                url: "/live-feed",
                category: article.category,
              });

              // Alert only 1 breaking news per poll cycle to prevent flood
              break;
            }
          }
        }

        // 2. Fetch live market indices for price breakout spikes
        const indicesRes = await fetch("/api/data/fetch/market/indices/overview");
        if (indicesRes.ok) {
          const indData = await indicesRes.json();
          const indices = indData.indices || [];
          const now = Date.now();

          for (const item of indices) {
            const absPct = Math.abs(item.dp || 0);
            const lastAlert = lastIndexAlertRef.current[item.symbol] || 0;

            // Trigger alert if an index has a major move (> 0.8%) and hasn't alerted in the last 20 minutes
            if (absPct >= 0.8 && now - lastAlert > 20 * 60 * 1000) {
              lastIndexAlertRef.current[item.symbol] = now;
              const isBull = (item.dp || 0) >= 0;

              addNotification({
                title: `${isBull ? "⚡" : "📉"} Market Surge: ${item.name} (${item.dp >= 0 ? "+" : ""}${item.dp?.toFixed(2)}%)`,
                message: `${item.name} is trading at ${item.c?.toLocaleString()} ${isBull ? "surging with heavy institutional liquidity" : "experiencing sharp volatility compression"}.`,
                type: isBull ? "bullish" : "bearish",
                source: "Market Engine",
                url: `/deep-dive?ticker=${encodeURIComponent(item.symbol)}`,
                category: "Equities",
              });
              break;
            }
          }
        }
      } catch (err) {
        console.warn("Notification polling warning:", err);
      }
    };

    // Initial check after 2 seconds
    const initialTimer = setTimeout(pollMarketAndNews, 2000);

    // Recurring check every 18 seconds
    const interval = setInterval(pollMarketAndNews, 18000);

    return () => {
      isMounted = false;
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [addNotification]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        activeToast,
        pushPermission,
        markAsRead,
        markAllAsRead,
        clearAll,
        dismissToast,
        requestPushPermission,
        triggerTestNotification,
        addNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
}
