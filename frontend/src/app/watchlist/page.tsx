"use client";

import { Star, Bookmark } from "lucide-react";

export default function Watchlist() {
  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto">
      <div className="glass-panel p-8 relative overflow-hidden flex justify-between items-center">
        <div className="absolute inset-0 bg-linear-to-r from-pink-500/10 to-rose-500/10 pointer-events-none"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-pink-500/10 text-pink-400 rounded-lg border border-pink-500/20">
              <Star className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-manrope font-bold">My Watchlist</h1>
          </div>
          <p className="text-slate-400 text-sm">Monitor your favorite assets with real-time AI insights</p>
        </div>
      </div>
      <div className="glass-panel p-8 flex flex-col items-center justify-center min-h-100">
        <Bookmark className="w-12 h-12 text-slate-600 mb-4" />
        <h2 className="text-lg font-bold text-slate-300">Your Watchlist is Empty</h2>
        <p className="text-sm text-slate-500 mt-2">Search for stocks and click the star icon to add them here.</p>
      </div>
    </div>
  );
}
