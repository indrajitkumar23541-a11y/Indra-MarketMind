"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useNav } from "@/lib/NavContext";
import { 
  LayoutDashboard, 
  Globe2, 
  Rss, 
  LineChart, 
  BarChart2, 
  Smile, 
  Activity, 
  RefreshCcw, 
  Key, 
  Star, 
  Bell, 
  Settings, 
  HelpCircle, 
  Zap,
  FlaskConical,
  X
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  const { isMobileNavOpen, closeMobileNav } = useNav();

  const mainLinks = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Global Map", href: "/global-map", icon: Globe2 },
    { name: "Live Feed", href: "/live-feed", icon: Rss },
    { name: "AI Forecast", href: "/forecast", icon: LineChart },
    { name: "Deep Dive", href: "/deep-dive", icon: BarChart2 },
    { name: "Fear & Greed", href: "/fear-greed", icon: Smile },
  ];

  const toolsLinks = [
    { name: "AI Quant Lab", href: "/research", icon: FlaskConical, badge: "Live" },
    { name: "Stock Screener", href: "/screener", icon: Activity, badge: "New" },
    { name: "Sector Rotation", href: "/sector", icon: RefreshCcw },
    { name: "Insider Signals", href: "/insider", icon: Key },
    { name: "Watchlist", href: "/watchlist", icon: Star },
    { name: "Alerts", href: "/alerts", icon: Bell },
  ];

  const settingsLinks = [
    { name: "Settings", href: "/settings", icon: Settings },
    { name: "Help & Support", href: "/support", icon: HelpCircle },
  ];

  const renderNavContent = (isMobile = false) => (
    <div className="flex flex-col h-full">
      <div className="p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3 mb-6 sm:mb-8">
          <Link 
            href="/" 
            onClick={isMobile ? closeMobileNav : undefined}
            className="flex items-center gap-3 group"
          >
            <img 
              src="/logo.png" 
              alt="Indra-MarketMind Logo" 
              className="w-9 h-9 rounded-xl object-cover border border-[#00F0FF]/40 shadow-[0_0_15px_rgba(0,240,255,0.4)] group-hover:scale-105 transition-transform" 
            />
            <div>
              <h1 className="font-space font-bold text-lg tracking-tight m-0 text-slate-100">
                Indra-<span className="text-[#00F0FF]">MarketMind</span>
              </h1>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold -mt-1">
                AI Financial Intelligence
              </p>
            </div>
          </Link>

          {isMobile && (
            <button
              onClick={closeMobileNav}
              aria-label="Close Navigation"
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="space-y-6">
          <div>
            <div className="text-[10px] font-bold tracking-widest text-slate-500 mb-2 px-3">MAIN</div>
            <div className="space-y-1">
              {mainLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={isMobile ? closeMobileNav : undefined}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-cyan-950/30 text-[#00F0FF] border border-[#00F0FF]/20 shadow-[inset_0_0_20px_rgba(0,240,255,0.05)]"
                        : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                    )}
                  >
                    <link.icon className={cn("w-4 h-4", isActive ? "text-[#00F0FF]" : "text-slate-400")} />
                    {link.name}
                  </Link>
                );
              })}
            </div>
          </div>

          <div>
            <div className="text-[10px] font-bold tracking-widest text-slate-500 mb-2 px-3">TOOLS</div>
            <div className="space-y-1">
              {toolsLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={isMobile ? closeMobileNav : undefined}
                    className={cn(
                      "flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-cyan-950/30 text-[#00F0FF] border border-[#00F0FF]/20 shadow-[inset_0_0_20px_rgba(0,240,255,0.05)]"
                        : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <link.icon className={cn("w-4 h-4", isActive ? "text-[#00F0FF]" : "")} />
                      {link.name}
                    </div>
                    {link.badge && (
                      <span className="text-[10px] bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-full font-bold">
                        {link.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          <div>
            <div className="text-[10px] font-bold tracking-widest text-slate-500 mb-2 px-3">SETTINGS</div>
            <div className="space-y-1">
              {settingsLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={isMobile ? closeMobileNav : undefined}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-cyan-950/30 text-[#00F0FF] border border-[#00F0FF]/20 shadow-[inset_0_0_20px_rgba(0,240,255,0.05)]"
                        : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                    )}
                  >
                    <link.icon className={cn("w-4 h-4", isActive ? "text-[#00F0FF]" : "")} />
                    {link.name}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-auto p-5 sm:p-6 pb-6">
        <div className="bg-gradient-to-br from-indigo-500/10 to-cyan-400/10 border border-indigo-500/30 rounded-xl p-4 text-center">
          <div className="text-amber-400 font-bold mb-1 flex items-center justify-center gap-2">
            <span className="text-lg">👑</span> Upgrade to Pro
          </div>
          <p className="text-xs text-slate-400 mb-4 leading-relaxed">
            Unlock advanced AI models, exclusive insights and more.
          </p>
          <button className="w-full bg-gradient-to-r from-indigo-500 to-blue-500 text-white text-xs font-bold py-2.5 rounded-lg shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-shadow cursor-pointer">
            Upgrade Now →
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* ── 1. Desktop Persistent Sidebar (Screens >= 1024px) ── */}
      <aside className="hidden lg:flex w-64 flex-col h-full bg-[#05070D] border-r border-white/5 overflow-y-auto custom-scrollbar flex-shrink-0">
        {renderNavContent(false)}
      </aside>

      {/* ── 2. Mobile Sliding Drawer & Backdrop (Screens < 1024px) ── */}
      {isMobileNavOpen && (
        <div 
          onClick={closeMobileNav}
          className="lg:hidden fixed inset-0 z-50 bg-black/80 backdrop-blur-md transition-opacity duration-300 animate-in fade-in"
          aria-hidden="true"
        />
      )}

      <div
        className={cn(
          "lg:hidden fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-[#070B14] border-r border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.9)] flex flex-col h-full overflow-y-auto custom-scrollbar transition-transform duration-300 ease-in-out",
          isMobileNavOpen ? "translate-x-0" : "-translate-x-full pointer-events-none"
        )}
      >
        {renderNavContent(true)}
      </div>
    </>
  );
}
