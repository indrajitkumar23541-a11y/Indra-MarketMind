"use client";

import React, { useState, useEffect } from "react";
import { Cpu, Sparkles, Activity } from "lucide-react";

interface QuantumLoaderProps {
  size?: "sm" | "md" | "lg" | "fullscreen";
  title?: string;
  subtitle?: string;
  showMicroMessages?: boolean;
}

const TELEMETRY_MESSAGES = [
  "Synchronizing 19 Global Exchange Telemetry...",
  "Synthesizing FinBERT & RoBERTa Neural Matrices...",
  "Running 7-Day Monte Carlo Stochastic Fan Cone...",
  "Ingesting Real-Time Institutional Order Flow...",
  "Verifying Capital Invalidation Risk Corridors...",
  "Calibrating High-Frequency Microstructure Feeds..."
];

export default function QuantumLoader({
  size = "md",
  title = "QUANTUM AI CORE",
  subtitle,
  showMicroMessages = true
}: QuantumLoaderProps) {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    if (!showMicroMessages || size === "sm") return;
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % TELEMETRY_MESSAGES.length);
    }, 2200);
    return () => clearInterval(interval);
  }, [showMicroMessages, size]);

  // Size dimensions mapping
  const sizeConfig = {
    sm: {
      box: "w-20 h-20",
      r1: "w-16 h-16",
      r2: "w-12 h-12",
      r3: "w-8 h-8",
      core: "w-4 h-4",
      icon: "w-2.5 h-2.5",
      orbit1: "-top-1 left-1/2 w-1.5 h-1.5",
      orbit2: "-bottom-1 left-1/2 w-1 h-1"
    },
    md: {
      box: "w-36 h-36",
      r1: "w-32 h-32",
      r2: "w-24 h-24",
      r3: "w-16 h-16",
      core: "w-8 h-8",
      icon: "w-4 h-4",
      orbit1: "-top-1.5 left-1/2 w-2.5 h-2.5",
      orbit2: "-bottom-1 left-1/2 w-2 h-2"
    },
    lg: {
      box: "w-52 h-52",
      r1: "w-48 h-48",
      r2: "w-36 h-36",
      r3: "w-24 h-24",
      core: "w-12 h-12",
      icon: "w-6 h-6",
      orbit1: "-top-2 left-1/2 w-3 h-3",
      orbit2: "-bottom-1.5 left-1/2 w-2.5 h-2.5"
    },
    fullscreen: {
      box: "w-60 h-60",
      r1: "w-56 h-56",
      r2: "w-44 h-44",
      r3: "w-32 h-32",
      core: "w-16 h-16",
      icon: "w-8 h-8",
      orbit1: "-top-2.5 left-1/2 w-3.5 h-3.5",
      orbit2: "-bottom-2 left-1/2 w-3 h-3"
    }
  };

  const currentSize = sizeConfig[size];

  const content = (
    <div className="flex flex-col items-center justify-center text-center select-none relative">
      {/* 3D Gyroscope Stage */}
      <div 
        className={`relative ${currentSize.box} flex items-center justify-center preserve-3d`}
        style={{ perspective: "1000px" }}
      >
        {/* Ambient Radial Corona Glow */}
        <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/20 via-indigo-500/15 to-purple-500/10 rounded-full blur-2xl animate-pulse pointer-events-none" />

        {/* 🪐 Ring 1: Outer Gyroscope Ring (Neon Cyan) */}
        <div 
          className={`absolute ${currentSize.r1} rounded-full border-2 border-cyan-400/40 border-dashed animate-gyro-1 preserve-3d shadow-[0_0_20px_rgba(0,240,255,0.35)]`}
        >
          {/* Orbiting Satellite Particle 1 */}
          <div className={`absolute ${currentSize.orbit1} -translate-x-1/2 bg-[#00F0FF] rounded-full shadow-[0_0_12px_#00F0FF]`} />
        </div>

        {/* 🪐 Ring 2: Middle Gyroscope Ring (Electric Indigo/Purple) */}
        <div 
          className={`absolute ${currentSize.r2} rounded-full border-2 border-indigo-400/60 border-t-cyan-300 border-b-purple-500 animate-gyro-2 preserve-3d shadow-[0_0_25px_rgba(99,102,241,0.4)]`}
        >
          {/* Orbiting Satellite Particle 2 */}
          <div className={`absolute ${currentSize.orbit2} -translate-x-1/2 bg-[#A855F7] rounded-full shadow-[0_0_10px_#A855F7]`} />
        </div>

        {/* 🪐 Ring 3: Inner Gyroscope Ring (Emerald Teal) */}
        <div 
          className={`absolute ${currentSize.r3} rounded-full border-2 border-teal-400/70 border-l-transparent animate-gyro-3 preserve-3d shadow-[0_0_20px_rgba(20,184,166,0.5)]`}
        />

        {/* ⚡ Central AI Fusion Core */}
        <div className={`relative ${currentSize.core} rounded-full bg-gradient-to-br from-[#00F0FF] via-indigo-600 to-purple-700 flex items-center justify-center text-white shadow-[0_0_30px_rgba(0,240,255,0.85)] animate-core-pulse z-10 border border-white/60`}>
          <Cpu className={`${currentSize.icon} text-slate-900 drop-shadow`} />
        </div>
      </div>

      {/* Telemetry Typography & Cyber Scanline */}
      {size !== "sm" && (
        <div className="mt-6 flex flex-col items-center max-w-sm px-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            <h3 className="font-mono text-xs sm:text-sm font-extrabold tracking-widest bg-gradient-to-r from-cyan-300 via-white to-indigo-300 bg-clip-text text-transparent uppercase">
              {title}
            </h3>
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" style={{ animationDuration: "8s" }} />
          </div>

          {/* Subtitle / Shifting Live Message */}
          <p className="text-[11px] sm:text-xs text-slate-400 font-sans tracking-wide min-h-[1.5rem] flex items-center justify-center transition-all duration-300">
            {subtitle || (showMicroMessages ? TELEMETRY_MESSAGES[messageIndex] : "Calibrating real-time telemetry...")}
          </p>

          {/* Cybernetic Progress Scanline Bar */}
          <div className="w-44 h-1 bg-slate-800/80 rounded-full overflow-hidden mt-3 relative border border-white/5">
            <div className="w-20 h-full bg-gradient-to-r from-transparent via-cyan-400 to-indigo-500 animate-scanline" />
          </div>
        </div>
      )}
    </div>
  );

  if (size === "fullscreen") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#05070D]/85 backdrop-blur-2xl">
        <div className="p-8 sm:p-12 rounded-3xl border border-cyan-500/20 bg-slate-950/70 shadow-2xl shadow-cyan-500/10 flex flex-col items-center">
          {content}
        </div>
      </div>
    );
  }

  return content;
}
