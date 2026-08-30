"use client";

import { Brain, LineChart as ChartIcon, Zap, Target } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ComposedChart, Line } from "recharts";
import { motion } from "framer-motion";

const forecastData = [
  { day: "Day 1", actual: 22000, predictMin: null, predictMax: null, predictAvg: null },
  { day: "Day 2", actual: 22150, predictMin: null, predictMax: null, predictAvg: null },
  { day: "Day 3", actual: 22300, predictMin: null, predictMax: null, predictAvg: null },
  { day: "Day 4", actual: 22250, predictMin: null, predictMax: null, predictAvg: null },
  { day: "Day 5", actual: 22400, predictMin: 22350, predictMax: 22450, predictAvg: 22400 },
  { day: "Day 6", actual: null, predictMin: 22450, predictMax: 22600, predictAvg: 22525 },
  { day: "Day 7", actual: null, predictMin: 22500, predictMax: 22800, predictAvg: 22650 },
  { day: "Day 8", actual: null, predictMin: 22600, predictMax: 22950, predictAvg: 22775 },
  { day: "Day 9", actual: null, predictMin: 22550, predictMax: 23100, predictAvg: 22825 },
];

export default function Forecast() {
  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="glass-panel p-8 relative overflow-hidden flex justify-between items-center">
        <div className="absolute inset-0 bg-linear-to-r from-indigo-500/10 to-[#00F0FF]/10 pointer-events-none"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg border border-indigo-500/20">
              <ChartIcon className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-manrope font-bold">AI Forecast Model (v4.2)</h1>
          </div>
          <p className="text-slate-400 text-sm">Predictive modeling using deep learning and sentiment analysis</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Chart */}
        <div className="lg:col-span-2 glass-panel p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-manrope font-bold text-lg flex items-center gap-2">
              NIFTY 50 <span className="text-xs bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded font-bold">7 Day Outlook</span>
            </h2>
          </div>

          <div className="h-100 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={forecastData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="predictGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00F0FF" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#00F0FF" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} dy={10} />
                <YAxis domain={['dataMin - 100', 'dataMax + 100']} axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  itemStyle={{ color: '#F8FAFC' }}
                />
                
                {/* Confidence Interval (Max-Min) */}
                <Area type="monotone" dataKey="predictMax" stroke="none" fill="url(#predictGradient)" />
                <Area type="monotone" dataKey="predictMin" stroke="none" fill="#05070D" />
                
                {/* Predicted Avg Line */}
                <Line type="monotone" dataKey="predictAvg" stroke="#00F0FF" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                
                {/* Actual Line */}
                <Area type="monotone" dataKey="actual" stroke="#10B981" strokeWidth={3} fill="url(#actualGradient)" />
                
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Analysis Panel */}
        <div className="space-y-6">
          <div className="glass-panel p-6">
            <h3 className="font-manrope font-bold text-sm mb-4 flex items-center gap-2 text-[#00F0FF]">
              <Brain className="w-4 h-4" /> AI Reasoning
            </h3>
            <ul className="space-y-4 text-sm text-slate-300">
              <motion.li initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="flex items-start gap-3">
                <Zap className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>Strong momentum detected from institutional buying in the IT sector.</span>
              </motion.li>
              <motion.li initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="flex items-start gap-3">
                <Target className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />
                <span>Sentiment analysis on global news is highly bullish (+0.78), supporting an upward trajectory.</span>
              </motion.li>
              <motion.li initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="flex items-start gap-3">
                <ChartIcon className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <span>RSI divergence on the 4H chart indicates a potential breakout above 22,600 resistance.</span>
              </motion.li>
            </ul>
          </div>

          <div className="glass-panel p-6">
             <h3 className="font-manrope font-bold text-sm mb-4">Probability Matrix</h3>
             <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">Target 23,000</span>
                    <span className="text-[#10B981] font-bold">68%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-[#10B981] w-[68%]"></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">Consolidation</span>
                    <span className="text-amber-400 font-bold">22%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-400 w-[22%]"></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">Correction</span>
                    <span className="text-red-400 font-bold">10%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-red-400 w-[10%]"></div>
                  </div>
                </div>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}
