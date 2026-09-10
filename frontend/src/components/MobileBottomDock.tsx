"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  LineChart, 
  BarChart2, 
  Smile, 
  Rss, 
  Menu 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useNav } from "@/lib/NavContext";

export default function MobileBottomDock() {
  const pathname = usePathname();
  const { toggleMobileNav } = useNav();

  const dockItems = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Forecast", href: "/forecast", icon: LineChart },
    { name: "Deep Dive", href: "/deep-dive", icon: BarChart2 },
    { name: "Fear/Greed", href: "/fear-greed", icon: Smile },
    { name: "Live Feed", href: "/live-feed", icon: Rss },
  ];

  return (
    <nav 
      aria-label="Mobile Bottom Navigation" 
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#070A14]/95 border-t border-white/10 backdrop-blur-xl px-2 py-1.5 shadow-[0_-10px_30px_rgba(0,0,0,0.8)] flex items-center justify-around safe-area-pb"
    >
      {dockItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all duration-200 min-w-14",
              isActive 
                ? "text-[#00F0FF]" 
                : "text-slate-400 hover:text-slate-200"
            )}
          >
            <div className={cn(
              "p-1 rounded-lg transition-all",
              isActive && "bg-cyan-500/15 shadow-[0_0_12px_rgba(0,240,255,0.4)]"
            )}>
              <item.icon className="w-5 h-5" />
            </div>
            <span className={cn(
              "text-[10px] font-semibold mt-0.5 tracking-tight",
              isActive ? "text-[#00F0FF] font-bold" : "text-slate-400"
            )}>
              {item.name}
            </span>
          </Link>
        );
      })}

      {/* Menu / All Tools Drawer Trigger */}
      <button
        onClick={toggleMobileNav}
        aria-label="Open Full Menu"
        className="flex flex-col items-center justify-center py-1 px-2 rounded-xl text-slate-400 hover:text-cyan-400 transition-all min-w-14 cursor-pointer"
      >
        <div className="p-1 rounded-lg">
          <Menu className="w-5 h-5" />
        </div>
        <span className="text-[10px] font-semibold mt-0.5 tracking-tight text-slate-400">
          Tools
        </span>
      </button>
    </nav>
  );
}
