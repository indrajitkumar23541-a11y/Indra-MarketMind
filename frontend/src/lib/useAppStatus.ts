"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "marketmind_app_downloaded";
const EVENT_NAME = "marketmind:app_downloaded";

export function useAppStatus() {
  const [isAppDownloadedOrInstalled, setIsAppDownloadedOrInstalled] = useState<boolean>(false);

  const checkStatus = useCallback(() => {
    if (typeof window === "undefined") return false;

    // 1. Running inside Standalone PWA or iOS WebClip
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;

    // 2. Running inside Android Capacitor Native Shell
    const isCapacitor = Boolean(
      (window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor?.isNativePlatform?.()
    );
    const isCustomUserAgent = /indramarketmind|capacitor/i.test(window.navigator.userAgent);

    // 3. User already clicked download APK or installed desktop app
    const hasDownloaded = localStorage.getItem(STORAGE_KEY) === "true";
    const hasInstalled = localStorage.getItem("marketmind_app_installed") === "true";

    const isInstalledOrDownloaded = isStandalone || isCapacitor || isCustomUserAgent || hasDownloaded || hasInstalled;
    setIsAppDownloadedOrInstalled(isInstalledOrDownloaded);
    return isInstalledOrDownloaded;
  }, []);

  useEffect(() => {
    checkStatus();

    const handleUpdate = () => {
      checkStatus();
    };

    window.addEventListener(EVENT_NAME, handleUpdate);
    window.addEventListener("appinstalled", handleUpdate);
    window.addEventListener("storage", handleUpdate);

    return () => {
      window.removeEventListener(EVENT_NAME, handleUpdate);
      window.removeEventListener("appinstalled", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, [checkStatus]);

  const markAppAsDownloaded = useCallback(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, "true");
      } catch (err) {
        console.error("Failed to set localStorage", err);
      }
      setIsAppDownloadedOrInstalled(true);
      window.dispatchEvent(new CustomEvent(EVENT_NAME));
    }
  }, []);

  const resetAppDownloadedStatus = useCallback(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem("marketmind_app_installed");
      } catch (err) {
        console.error("Failed to clear localStorage", err);
      }
      setIsAppDownloadedOrInstalled(false);
      window.dispatchEvent(new CustomEvent(EVENT_NAME));
    }
  }, []);

  return {
    isAppDownloadedOrInstalled,
    markAppAsDownloaded,
    resetAppDownloadedStatus,
  };
}
