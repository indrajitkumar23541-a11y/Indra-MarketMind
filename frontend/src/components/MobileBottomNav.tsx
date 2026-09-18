"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Rss, Activity, LineChart, Brain } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSettings } from "@/lib/SettingsContext";

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { t } = useSettings();

  const navItems = [
    {
      id: "dashboard",
      name: t("nav.bottom.dashboard") || "Dashboard",
      href: "/",
      icon: LayoutDashboard,
    },
    {
      id: "feed",
      name: t("nav.bottom.feed") || "Feed",
      href: "/live-feed",
      icon: Rss,
    },
    {
      id: "screener",
      name: t("nav.bottom.screener") || "Screener",
      href: "/screener",
      icon: Activity,
      badge: "Live",
    },
    {
      id: "forecast",
      name: t("nav.bottom.forecast") || "Forecast",
      href: "/forecast",
      icon: LineChart,
    },
    {
      id: "copilot",
      name: t("nav.bottom.copilot") || "Copilot",
      href: "/copilot",
      icon: Brain,
      isCopilot: true,
      badge: "AI",
    },
  ];

  return (
    <nav 
      aria-label="Mobile Navigation"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#070B14]/95 backdrop-blur-2xl border-t border-cyan-500/20 shadow-[0_-12px_36px_rgba(0,0,0,0.9)]"
      style={{ paddingBottom: "max(0.65rem, env(safe-area-inset-bottom))" }}
    >
      <div className="grid grid-cols-5 items-center max-w-md mx-auto w-full px-1 pt-1.5 pb-0.5">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.id}
              href={item.href}
              aria-label={item.name}
              className="relative flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all group cursor-pointer active:scale-95 select-none"
            >
              {/* Active Top Glowing Accent Line */}
              {isActive && (
                <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-8 h-[2.5px] rounded-full bg-gradient-to-r from-cyan-400 to-indigo-500 shadow-[0_0_12px_rgba(0,240,255,0.9)]" />
              )}

              {/* Icon Container with state styling */}
              <div className="relative">
                <div
                  className={cn(
                    "w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200",
                    item.isCopilot
                      ? isActive
                        ? "bg-gradient-to-tr from-cyan-400 via-indigo-500 to-purple-600 text-black shadow-[0_0_14px_rgba(0,240,255,0.7)] scale-105"
                        : "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 group-hover:bg-cyan-500/25"
                      : isActive
                      ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 shadow-[0_0_12px_rgba(0,240,255,0.35)] scale-105"
                      : "text-slate-400 group-hover:text-slate-200"
                  )}
                >
                  <Icon
                    className={cn(
                      "w-4 h-4 transition-transform",
                      isActive ? "scale-105" : "group-active:scale-90"
                    )}
                  />
                </div>

                {/* Badge Indicator */}
                {item.badge && (
                  <span
                    className={cn(
                      "absolute -top-1 -right-1.5 text-[7.5px] px-1 py-0.2 rounded-full font-bold font-mono tracking-tighter shadow-sm",
                      item.isCopilot
                        ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                        : isActive
                        ? "bg-cyan-400 text-black"
                        : "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 animate-pulse"
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </div>

              {/* Clean Single-Line Label */}
              <span
                className={cn(
                  "text-[10.5px] font-space tracking-tight truncate whitespace-nowrap mt-1 leading-none text-center max-w-full",
                  isActive
                    ? "font-bold text-cyan-300 drop-shadow-[0_0_6px_rgba(0,240,255,0.4)]"
                    : "font-medium text-slate-400 group-hover:text-slate-300"
                )}
              >
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
