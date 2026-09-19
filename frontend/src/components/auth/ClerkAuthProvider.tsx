"use client";

import React, { useEffect } from "react";
import { ClerkProvider, useUser, useClerk, GoogleOneTap } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { AuthProvider, useMarketMindAuth, MarketMindUser } from "@/lib/AuthContext";
import AuthModal from "./AuthModal";

// Sub-component to synchronize live Clerk authenticated state into MarketMind app state
function ClerkStateSynchronizer() {
  const { user: clerkUser, isLoaded, isSignedIn } = useUser();
  const { signOut: clerkSignOut } = useClerk();
  const { user: currentMarketMindUser, setSessionUser, registerSignOutHandler } = useMarketMindAuth();

  useEffect(() => {
    registerSignOutHandler(async () => {
      try {
        await clerkSignOut();
      } catch (e) {
        console.warn("Clerk sign out error", e);
      }
    });
  }, [registerSignOutHandler, clerkSignOut]);

  useEffect(() => {
    if (isLoaded) {
      if (isSignedIn && clerkUser) {
        if (currentMarketMindUser?.id === clerkUser.id) {
          return;
        }

        const primaryEmail =
          clerkUser.primaryEmailAddress?.emailAddress ||
          clerkUser.emailAddresses[0]?.emailAddress ||
          "";
        const fullName =
          clerkUser.fullName ||
          clerkUser.firstName ||
          primaryEmail.split("@")[0] ||
          "Trader";

        const initials =
          (clerkUser.firstName?.[0] || "") + (clerkUser.lastName?.[0] || "") ||
          fullName.slice(0, 2).toUpperCase() ||
          "IK";

        const mappedUser: MarketMindUser = {
          id: clerkUser.id,
          fullName,
          firstName: clerkUser.firstName || fullName,
          lastName: clerkUser.lastName || "",
          email: primaryEmail,
          imageUrl: clerkUser.imageUrl,
          initials: initials.toUpperCase(),
          isPro: true,
        };

        setSessionUser(mappedUser);

        // Determine Login / Registration Method
        let method = "Email OTP Verification";
        if (clerkUser.externalAccounts && clerkUser.externalAccounts.length > 0) {
          const prov = clerkUser.externalAccounts[0]?.provider || "Google";
          method = prov.includes("google") ? "Google 1-Tap / OAuth" : `${prov.toUpperCase()} OAuth`;
        } else if (clerkUser.phoneNumbers && clerkUser.phoneNumbers.length > 0) {
          method = "Phone Number (SMS OTP)";
        }

        // Dispatch instant alert to Admin (indrajitkumar23541@gmail.com) if not already notified
        const notifyKey = `marketmind_admin_notified_${clerkUser.id}`;
        if (typeof window !== "undefined" && !localStorage.getItem(notifyKey)) {
          fetch("/api/admin/notify-new-user", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: clerkUser.id,
              name: fullName,
              email: primaryEmail,
              joinedAt: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
              method,
            }),
          })
            .then((r) => {
              if (r.ok) {
                localStorage.setItem(notifyKey, "true");
              }
            })
            .catch((e) => {
              console.warn("[Admin Alert] Dispatch error:", e);
            });
        }
      } else if (!isSignedIn) {
        // If not signed into Clerk, ensure stale mock sessions do not linger
        if (
          currentMarketMindUser?.id?.startsWith("usr_") &&
          (currentMarketMindUser?.email === "indrajitkumar23541@gmail.com" ||
            currentMarketMindUser?.imageUrl?.includes("unavatar.io"))
        ) {
          setSessionUser(null);
        }
      }
    }
  }, [isLoaded, isSignedIn, clerkUser, currentMarketMindUser, setSessionUser]);

  return null;
}

export default function ClerkAuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const isKeyValid = Boolean(publishableKey && publishableKey.startsWith("pk_"));

  if (!isKeyValid) {
    // If Clerk key has not yet been set in .env.local, render resilient Fallback Auth Provider
    return (
      <AuthProvider isClerkConfigured={false}>
        {children}
        <AuthModal />
      </AuthProvider>
    );
  }

  // When Clerk publishable key is present, wrap with native ClerkProvider
  return (
    <ClerkProvider
      publishableKey={publishableKey}
      appearance={{
        theme: dark,
        variables: {
          colorPrimary: "#00F0FF",
          borderRadius: "0.75rem",
          fontFamily: "var(--font-inter), sans-serif",
        },
        elements: {
          card: "bg-[#0A0E1A] border border-cyan-500/20 shadow-[0_0_35px_rgba(0,240,255,0.15)]",
          formButtonPrimary:
            "bg-gradient-to-r from-cyan-400 to-indigo-500 text-black font-bold hover:brightness-110 shadow-[0_0_15px_rgba(0,240,255,0.4)]",
          footerActionLink: "text-cyan-400 hover:text-cyan-300 font-semibold",
          headerTitle: "text-white font-space font-bold",
          headerSubtitle: "text-slate-400 text-xs",
        },
      }}
    >
      <AuthProvider isClerkConfigured={true}>
        {/* Google One Tap for instant ChatGPT-style mobile/desktop auto-login */}
        <GoogleOneTap />
        <ClerkStateSynchronizer />
        {children}
        <AuthModal />
      </AuthProvider>
    </ClerkProvider>
  );
}
