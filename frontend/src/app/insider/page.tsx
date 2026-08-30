"use client";

import { Key, Eye } from "lucide-react";

export default function InsiderSignals() {
  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto">
      <div className="glass-panel p-8 relative overflow-hidden flex justify-between items-center">
        <div className="absolute inset-0 bg-linear-to-r from-yellow-500/10 to-orange-500/10 pointer-events-none"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-yellow-500/10 text-yellow-400 rounded-lg border border-yellow-500/20">
              <Key className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-manrope font-bold">Insider Signals & Block Deals</h1>
          </div>
          <p className="text-slate-400 text-sm">Track smart money movements and institutional buying/selling</p>
        </div>
      </div>
      <div className="glass-panel p-8 flex flex-col items-center justify-center min-h-100">
        <Eye className="w-12 h-12 text-slate-600 mb-4" />
        <h2 className="text-lg font-bold text-slate-300">Scanning for Insider Transactions...</h2>
        <p className="text-sm text-slate-500 mt-2">Connecting to exchange data feeds.</p>
      </div>
    </div>
  );
}
