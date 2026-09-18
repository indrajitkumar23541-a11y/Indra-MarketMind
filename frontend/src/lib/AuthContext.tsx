"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface MarketMindUser {
  id: string;
  fullName: string;
  firstName?: string;
  lastName?: string;
  email: string;
  imageUrl?: string;
  initials: string;
  isPro?: boolean;
}

interface AuthContextType {
  user: MarketMindUser | null;
  isSignedIn: boolean;
  isLoaded: boolean;
  isClerkConfigured: boolean;
  isAuthModalOpen: boolean;
  authModalMode: "sign-in" | "sign-up";
  openSignIn: () => void;
  openSignUp: () => void;
  closeAuthModal: () => void;
  signOut: () => Promise<void>;
  simulateLogin: (email: string, name?: string, imageUrl?: string) => void;
  setSessionUser: (user: MarketMindUser | null) => void;
  registerSignOutHandler: (handler: () => Promise<void>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_STORAGE_AUTH_KEY = "marketmind_user_session";

export function AuthProvider({
  children,
  isClerkConfigured = false,
}: {
  children: React.ReactNode;
  isClerkConfigured?: boolean;
}) {
  const [user, setUser] = useState<MarketMindUser | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<"sign-in" | "sign-up">("sign-in");
  const externalSignOutRef = React.useRef<(() => Promise<void>) | null>(null);

  // Load persistent session (ChatGPT style automatic device persistence)
  useEffect(() => {
    try {
      const savedSession = localStorage.getItem(LOCAL_STORAGE_AUTH_KEY);
      if (savedSession) {
        const parsed = JSON.parse(savedSession);
        // Clear any old hardcoded default mock session
        if (parsed && parsed.email === "indrajit.quant@marketmind.ai" && parsed.id?.startsWith("usr_")) {
          try {
            localStorage.removeItem(LOCAL_STORAGE_AUTH_KEY);
          } catch {}
          setUser(null);
        } else if (parsed && parsed.email) {
          setUser(parsed);
        }
      }
    } catch {
      // Fallback cleanly on SSR or restricted cookies
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const openSignIn = React.useCallback(() => {
    setAuthModalMode("sign-in");
    setIsAuthModalOpen(true);
  }, []);

  const openSignUp = React.useCallback(() => {
    setAuthModalMode("sign-up");
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = React.useCallback(() => {
    setIsAuthModalOpen(false);
  }, []);

  const setSessionUser = React.useCallback((newUser: MarketMindUser | null) => {
    setUser(newUser);
    try {
      if (newUser) {
        localStorage.setItem(LOCAL_STORAGE_AUTH_KEY, JSON.stringify(newUser));
      } else {
        localStorage.removeItem(LOCAL_STORAGE_AUTH_KEY);
      }
    } catch {
      // ignore
    }
  }, []);

  const registerSignOutHandler = React.useCallback((handler: () => Promise<void>) => {
    externalSignOutRef.current = handler;
  }, []);

  const simulateLogin = React.useCallback((
    email: string,
    name?: string,
    imageUrl?: string
  ) => {
    let resolvedName = name?.trim();
    if (!resolvedName) {
      const prefix = email.split("@")[0] || "Trader";
      resolvedName = prefix
        .split(/[._-]/)
        .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
        .join(" ");
    }

    const initials = resolvedName
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

    const newUser: MarketMindUser = {
      id: "usr_" + Math.random().toString(36).substring(2, 9),
      fullName: resolvedName,
      firstName: resolvedName.split(" ")[0],
      email: email.trim(),
      imageUrl: imageUrl,
      initials: initials || "U",
      isPro: true,
    };

    setSessionUser(newUser);
    try {
      const rawSettings = localStorage.getItem("indra_settings_v3");
      if (rawSettings) {
        const s = JSON.parse(rawSettings);
        s.displayName = resolvedName;
        s.email = email.trim();
        localStorage.setItem("indra_settings_v3", JSON.stringify(s));
      }
    } catch {
      // ignore
    }
    setIsAuthModalOpen(false);
  }, [setSessionUser]);

  const signOut = React.useCallback(async () => {
    if (externalSignOutRef.current) {
      try {
        await externalSignOutRef.current();
      } catch (err) {
        console.warn("External sign out error:", err);
      }
    }
    setUser(null);
    try {
      localStorage.removeItem(LOCAL_STORAGE_AUTH_KEY);
    } catch {
      // ignore
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isSignedIn: Boolean(user),
        isLoaded,
        isClerkConfigured,
        isAuthModalOpen,
        authModalMode,
        openSignIn,
        openSignUp,
        closeAuthModal,
        signOut,
        simulateLogin,
        setSessionUser,
        registerSignOutHandler,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useMarketMindAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useMarketMindAuth must be used within an AuthProvider");
  }
  return context;
}
