"use client";

import { BarChart2, Activity, ShieldAlert, Cpu, Layers } from "lucide-react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, BarChart, Bar, XAxis, Tooltip } from "recharts";
import { motion } from "framer-motion";

const radarData = [
  { subject: 'Growth', A: 120, fullMark: 150 },
  { subject: 'Value', A: 98, fullMark: 150 },
  { subject: 'Momentum', A: 130, fullMark: 150 },
  { subject: 'Quality', A: 110, fullMark: 150 },
  { subject: 'Volatility', A: 85, fullMark: 150 },
  { subject: 'Yield', A: 65, fullMark: 150 },
];

const barData = [
  { name: 'Q1', EPS: 4.2 },
  { name: 'Q2', EPS: 4.8 },
  { name: 'Q3', EPS: 5.1 },
  { name: 'Q4 (Est)', EPS: 5.6 },
];

export default function DeepDive() {
  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="glass-panel p-8 relative overflow-hidden flex justify-between items-center">
        <div className="absolute inset-0 bg-linear-to-r from-emerald-500/10 to-teal-500/10 pointer-events-none"></div>
        <div className="relative z-10 flex items-center gap-6">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-2xl font-black text-black">
            R
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-manrope font-bold">RELIANCE</h1>
              <span className="px-2 py-0.5 bg-white/10 rounded text-xs font-bold text-slate-300">NSE</span>
            </div>
            <p className="text-slate-400 text-sm">Reliance Industries Limited</p>
          </div>
        </div>
        <div className="relative z-10 text-right">
          <div className="text-3xl font-manrope font-bold text-white mb-1">₹ 2,850.50</div>
          <div className="text-[#10B981] font-semibold text-sm">+36.20 (1.28%)</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Radar Chart */}
        <div className="lg:col-span-4 glass-panel p-6 flex flex-col items-center">
          <h3 className="w-full font-manrope font-bold text-sm mb-2 text-left flex items-center gap-2">
            <Target className="w-4 h-4 text-teal-400" /> Factor Analysis
          </h3>
          <div className="w-full h-75">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94A3B8', fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                <Radar name="RELIANCE" dataKey="A" stroke="#14B8A6" fill="#14B8A6" fillOpacity={0.4} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Fundamental Metrics */}
        <div className="lg:col-span-8 glass-panel p-6">
          <h3 className="font-manrope font-bold text-sm mb-6 flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-400" /> Key Fundamentals
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <div>
              <div className="text-[10px] text-slate-500 font-bold mb-1 uppercase">Market Cap</div>
              <div className="font-semibold text-lg">19.2T</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500 font-bold mb-1 uppercase">P/E Ratio</div>
              <div className="font-semibold text-lg">28.4</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500 font-bold mb-1 uppercase">Div Yield</div>
              <div className="font-semibold text-lg">0.35%</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500 font-bold mb-1 uppercase">Beta (1Y)</div>
              <div className="font-semibold text-lg">1.12</div>
            </div>
          </div>
          
          <h3 className="font-manrope font-bold text-sm mb-4">Earnings Per Share (EPS) Trend</h3>
          <div className="h-50 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} dy={10} />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                />
                <Bar dataKey="EPS" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Summary Box */}
        <div className="lg:col-span-12 bg-blue-500/10 border border-blue-500/30 rounded-xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-20"><Cpu className="w-24 h-24 text-blue-400" /></div>
          <h3 className="font-manrope font-bold text-lg mb-2 text-blue-400">AI Deep Dive Summary</h3>
          <p className="text-sm text-slate-300 leading-relaxed max-w-4xl relative z-10">
            Reliance Industries exhibits strong momentum driven by robust refining margins and aggressive retail expansion. 
            The technical setup remains bullish, supported by a healthy factor score across Growth and Quality metrics. 
            However, short-term volatility might be observed near the ₹2,900 resistance level. 
            Institutional holding has increased by 1.2% over the last quarter, signaling smart money accumulation.
          </p>
        </div>

      </div>
    </div>
  );
}

// Temporary internal Target icon since I used it but forgot to import
function Target(props: any) {
  return <ShieldAlert {...props} />
}
