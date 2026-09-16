"use client";

import React from "react";
import QuantumLoader from "@/components/QuantumLoader";

export default function Loading() {
  return (
    <div className="w-full min-h-[65vh] flex items-center justify-center p-4">
      <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-cyan-500/20 bg-slate-950/60 shadow-2xl shadow-cyan-500/10 flex flex-col items-center">
        <QuantumLoader 
          size="lg" 
          title="QUANTUM NEURAL ENGINE"
          subtitle="Loading financial intelligence & live market vectors..."
        />
      </div>
    </div>
  );
}
