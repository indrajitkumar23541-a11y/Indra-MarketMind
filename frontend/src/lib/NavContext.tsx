"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { usePathname } from "next/navigation";

interface NavContextType {
  isMobileNavOpen: boolean;
  setIsMobileNavOpen: (open: boolean) => void;
  toggleMobileNav: () => void;
  closeMobileNav: () => void;
  isCopilotOpen: boolean;
  setIsCopilotOpen: (open: boolean) => void;
  toggleCopilot: () => void;
  openCopilot: () => void;
  closeCopilot: () => void;
}

const NavContext = createContext<NavContextType>({
  isMobileNavOpen: false,
  setIsMobileNavOpen: () => {},
  toggleMobileNav: () => {},
  closeMobileNav: () => {},
  isCopilotOpen: false,
  setIsCopilotOpen: () => {},
  toggleCopilot: () => {},
  openCopilot: () => {},
  closeCopilot: () => {},
});

export function NavProvider({ children }: { children: React.ReactNode }) {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const pathname = usePathname();

  // Close mobile navigation drawer whenever route/pathname changes
  useEffect(() => {
    setIsMobileNavOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (isMobileNavOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileNavOpen]);

  const toggleMobileNav = () => {
    setIsMobileNavOpen((prev) => {
      if (!prev) setIsCopilotOpen(false); // Close copilot if opening nav
      return !prev;
    });
  };
  const closeMobileNav = () => setIsMobileNavOpen(false);

  const toggleCopilot = () => {
    setIsCopilotOpen((prev) => {
      if (!prev) setIsMobileNavOpen(false); // Close nav drawer if opening copilot
      return !prev;
    });
  };
  const openCopilot = () => {
    setIsMobileNavOpen(false);
    setIsCopilotOpen(true);
  };
  const closeCopilot = () => setIsCopilotOpen(false);

  return (
    <NavContext.Provider
      value={{
        isMobileNavOpen,
        setIsMobileNavOpen,
        toggleMobileNav,
        closeMobileNav,
        isCopilotOpen,
        setIsCopilotOpen,
        toggleCopilot,
        openCopilot,
        closeCopilot,
      }}
    >
      {children}
    </NavContext.Provider>
  );
}

export function useNav() {
  return useContext(NavContext);
}
