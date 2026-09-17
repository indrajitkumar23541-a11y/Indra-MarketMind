"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Rss, Activity, LineChart, Menu } from "lucide-react";
import { useNav } from "@/lib/NavContext";
import { cn } from "@/lib/utils";

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { toggleMobileNav, isMobileNavOpen } = useNav();

  const navItems = [
    { name: "Overview", href: "/", icon: LayoutDashboard },
    { name: "Feed", href: "/live-feed", icon: Rss },
    { name: "Screener", href: "/screener", icon: Activity, badge: "Live" },
    { name: "Forecast", href: "/forecast", icon: LineChart },
  ];

  return (
    <nav 
      aria-label="Mobile Navigation"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#070B14]/95 backdrop-blur-xl border-t border-white/10 px-2 py-1.5 shadow-[0_-10px_30px_rgba(0,0,0,0.8)]"
      style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}
    >
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "relative flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all group min-w-[56px]",
                isActive
                  ? "text-[#00F0FF]"
                  : "text-slate-400 hover:text-slate-200"
              )}
            >
              <div className="relative">
                <Icon
                  className={cn(
                    "w-5 h-5 transition-transform group-active:scale-90",
                    isActive ? "text-[#00F0FF] drop-shadow-[0_0_8px_rgba(0,240,255,0.7)]" : "text-slate-400"
                  )}
                />
                {item.badge && !isActive && (
                  <span className="absolute -top-1 -right-2 w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                )}
              </div>
              <span
                className={cn(
                  "text-[10px] font-space tracking-tight mt-0.5",
                  isActive ? "font-bold text-[#00F0FF]" : "font-medium text-slate-400"
                )}
              >
                {item.name}
              </span>

              {isActive && (
                <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-[#00F0FF] shadow-[0_0_6px_#00F0FF]" />
              )}
            </Link>
          );
        })}

        {/* 5th Tab: Menu Toggle (opens sidebar drawer) */}
        <button
          onClick={toggleMobileNav}
          aria-label="Open Full Menu"
          className={cn(
            "relative flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all group min-w-[56px] cursor-pointer",
            isMobileNavOpen ? "text-[#00F0FF]" : "text-slate-400 hover:text-slate-200"
          )}
        >
          <div className="relative">
            <Menu
              className={cn(
                "w-5 h-5 transition-transform group-active:scale-90",
                isMobileNavOpen ? "text-[#00F0FF] drop-shadow-[0_0_8px_rgba(0,240,255,0.7)]" : "text-slate-400"
              )}
            />
            <span className="absolute -top-1 -right-2 text-[8px] bg-indigo-500 text-white px-1 rounded-full font-bold">
              13
            </span>
          </div>
          <span
            className={cn(
              "text-[10px] font-space tracking-tight mt-0.5",
              isMobileNavOpen ? "font-bold text-[#00F0FF]" : "font-medium text-slate-400"
            )}
          >
            Menu
          </span>
          {isMobileNavOpen && (
            <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-[#00F0FF] shadow-[0_0_6px_#00F0FF]" />
          )}
        </button>
      </div>
    </nav>
  );
}
