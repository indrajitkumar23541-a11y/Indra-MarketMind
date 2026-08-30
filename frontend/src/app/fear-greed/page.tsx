"use client";

import { Smile, AlertTriangle, Info, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { motion } from "framer-motion";

const historicalData = [
  { date: "Jan", index: 55 },
  { date: "Feb", index: 68 },
  { date: "Mar", index: 82 }, // Extreme Greed
  { date: "Apr", index: 45 },
  { date: "May", index: 30 },
  { date: "Jun", index: 22 }, // Extreme Fear
  { date: "Jul", index: 48 },
  { date: "Aug", index: 67 }, // Greed
];

export default function FearGreed() {
  const currentIndex = 67;

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="glass-panel p-8 relative overflow-hidden flex justify-between items-center">
        <div className="absolute inset-0 bg-linear-to-r from-green-500/10 to-orange-500/10 pointer-events-none"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-500/10 text-green-400 rounded-lg border border-green-500/20">
              <Smile className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-manrope font-bold">Global Fear & Greed Index</h1>
          </div>
          <p className="text-slate-400 text-sm">Quantifying market emotions to identify extremes</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Main Gauge */}
        <div className="lg:col-span-5 glass-panel p-8 flex flex-col items-center justify-center relative">
          <div className="absolute top-4 right-4 text-slate-500 hover:text-white cursor-pointer"><Info className="w-4 h-4"/></div>
          
          <h2 className="font-manrope font-bold text-lg mb-8">Current Emotion</h2>
          
          <div className="relative w-64 h-32 overflow-hidden mb-6">
            <svg viewBox="0 0 100 50" className="w-full h-full overflow-visible drop-shadow-2xl">
              <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="16" strokeLinecap="round" />
              {/* Gradient Arc based on current index 67 */}
              <defs>
                <linearGradient id="gaugeGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#EF4444" />
                  <stop offset="30%" stopColor="#F59E0B" />
                  <stop offset="70%" stopColor="#10B981" />
                  <stop offset="100%" stopColor="#059669" />
                </linearGradient>
              </defs>
              <motion.path 
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 0.67 }} // 67%
                transition={{ duration: 1.5, ease: "easeOut" }}
                d="M 10 50 A 40 40 0 0 1 90 50" 
                fill="none" 
                stroke="url(#gaugeGrad)" 
                strokeWidth="16" 
                strokeLinecap="round" 
              />
            </svg>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex flex-col items-center">
              <div className="text-5xl font-manrope font-extrabold text-[#10B981] drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]">
                67
              </div>
            </div>
          </div>
          
          <div className="text-xl font-bold text-[#10B981] mb-2 uppercase tracking-widest">Greed</div>
          <p className="text-xs text-slate-400 text-center max-w-xs">
            Investors are currently exhibiting greedy behavior. Historically, this may indicate a market top is approaching.
          </p>
        </div>

        {/* Historical Chart */}
        <div className="lg:col-span-7 glass-panel p-6">
          <h3 className="font-manrope font-bold text-sm mb-6">Historical Trend (1 Year)</h3>
          <div className="h-62.5 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={historicalData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="fearGreedGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4}/>
                    <stop offset="50%" stopColor="#F59E0B" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0.4}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} dy={10} />
                <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                />
                <ReferenceLine y={25} stroke="#EF4444" strokeDasharray="3 3" strokeOpacity={0.5} label={{ position: 'insideTopLeft', value: 'Extreme Fear', fill: '#EF4444', fontSize: 10 }} />
                <ReferenceLine y={75} stroke="#10B981" strokeDasharray="3 3" strokeOpacity={0.5} label={{ position: 'insideTopLeft', value: 'Extreme Greed', fill: '#10B981', fontSize: 10 }} />
                
                <Area type="monotone" dataKey="index" stroke="#F59E0B" strokeWidth={3} fill="url(#fearGreedGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Breakdown Widgets */}
        <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-panel p-5">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Market Momentum</h4>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">S&P 500 vs 125-Day Avg</span>
              <span className="text-[#10B981] font-bold flex items-center gap-1">Greed <TrendingUp className="w-3 h-3"/></span>
            </div>
          </div>
          <div className="glass-panel p-5">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Stock Price Strength</h4>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">52-Week Highs vs Lows</span>
              <span className="text-[#10B981] font-bold flex items-center gap-1">Greed <TrendingUp className="w-3 h-3"/></span>
            </div>
          </div>
          <div className="glass-panel p-5">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Safe Haven Demand</h4>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">Stocks vs Bonds Return</span>
              <span className="text-amber-500 font-bold flex items-center gap-1">Neutral <Minus className="w-3 h-3"/></span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
