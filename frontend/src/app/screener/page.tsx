"use client";

import { Activity, Filter } from "lucide-react";

export default function Screener() {
  return (
    <div className="space-y-6 pb-2 sm:pb-6 max-w-7xl mx-auto">
      <div className="glass-panel p-4 sm:p-6 md:p-8 relative overflow-hidden flex justify-between items-center">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 pointer-events-none"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 sm:p-2.5 bg-cyan-500/10 text-cyan-400 rounded-lg border border-cyan-500/20 shrink-0">
              <Activity className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-manrope font-bold text-white">Stock Screener</h1>
          </div>
          <p className="text-slate-400 text-xs sm:text-sm">Filter and discover high-potential stocks using AI signals</p>
        </div>
      </div>
      <div className="glass-panel p-6 sm:p-8 flex flex-col items-center justify-center min-h-72 sm:min-h-100 text-center">
        <Filter className="w-10 h-10 sm:w-12 sm:h-12 text-slate-600 mb-4" />
        <h2 className="text-base sm:text-lg font-bold text-slate-300">Screener Data Ready</h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-2">Connecting to live algorithmic screeners.</p>
      </div>
    </div>
  );
}
