"use client";

import { RefreshCcw, ArrowRight } from "lucide-react";
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const sectorData = [
  { name: "IT", momentum: 85, strength: 90, size: 400, color: "#10B981" },
  { name: "Banks", momentum: 45, strength: 55, size: 600, color: "#F59E0B" },
  { name: "Pharma", momentum: 70, strength: 65, size: 300, color: "#00F0FF" },
  { name: "Auto", momentum: 20, strength: 35, size: 250, color: "#EF4444" },
  { name: "FMCG", momentum: 60, strength: 50, size: 350, color: "#8B5CF6" },
  { name: "Energy", momentum: 95, strength: 80, size: 500, color: "#10B981" },
  { name: "Metal", momentum: 30, strength: 25, size: 200, color: "#EF4444" },
];

export default function SectorRotation() {
  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="glass-panel p-4 sm:p-6 md:p-8 relative overflow-hidden flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 pointer-events-none"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 sm:p-2.5 bg-purple-500/10 text-purple-400 rounded-lg border border-purple-500/20 shrink-0">
              <RefreshCcw className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-manrope font-bold text-white">Sector Rotation</h1>
          </div>
          <p className="text-slate-400 text-xs sm:text-sm">Track institutional money flow across market sectors</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Rotation Chart */}
        <div className="lg:col-span-8 glass-panel p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4 mb-4 sm:mb-6">
            <h2 className="font-manrope font-bold text-base sm:text-lg text-white">Relative Rotation Graph (RRG)</h2>
            <div className="flex flex-wrap gap-2 text-slate-300">
              <span className="text-[10px] flex items-center gap-1"><div className="w-2 h-2 bg-[#10B981] rounded-full"></div> Leading</span>
              <span className="text-[10px] flex items-center gap-1"><div className="w-2 h-2 bg-[#F59E0B] rounded-full"></div> Weakening</span>
              <span className="text-[10px] flex items-center gap-1"><div className="w-2 h-2 bg-[#EF4444] rounded-full"></div> Lagging</span>
              <span className="text-[10px] flex items-center gap-1"><div className="w-2 h-2 bg-[#00F0FF] rounded-full"></div> Improving</span>
            </div>
          </div>
          
          <div className="h-72 sm:h-96 md:h-100 w-full relative">
            {/* Quadrant Backgrounds */}
            <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 opacity-5 pointer-events-none">
              <div className="border-r border-b border-white bg-red-500"></div>
              <div className="border-b border-white bg-blue-500"></div>
              <div className="border-r border-white bg-yellow-500"></div>
              <div className="bg-green-500"></div>
            </div>

            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: 0 }}>
                <XAxis type="number" dataKey="strength" name="Relative Strength" domain={[0, 100]} tick={{ fill: '#64748B', fontSize: 11 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
                <YAxis type="number" dataKey="momentum" name="Relative Momentum" domain={[0, 100]} tick={{ fill: '#64748B', fontSize: 11 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
                <ZAxis type="number" dataKey="size" range={[100, 1000]} name="Market Cap" />
                <Tooltip 
                  cursor={{ strokeDasharray: '3 3' }} 
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                />
                <Scatter name="Sectors" data={sectorData}>
                  {sectorData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.8} stroke={entry.color} strokeWidth={2} className="drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]" />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Momentum Flow */}
        <div className="lg:col-span-4 space-y-6 flex flex-col">
          <div className="glass-panel p-5 flex-1">
            <h3 className="font-manrope font-bold text-sm mb-4">Strongest Inflow (24H)</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#10B981]/20 border border-[#10B981]/50 flex items-center justify-center text-xs font-bold text-[#10B981]">1</div>
                  <span className="font-semibold text-sm">Energy</span>
                </div>
                <span className="text-[#10B981] font-bold text-sm">+₹ 4,500 Cr</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#10B981]/20 border border-[#10B981]/50 flex items-center justify-center text-xs font-bold text-[#10B981]">2</div>
                  <span className="font-semibold text-sm">IT Services</span>
                </div>
                <span className="text-[#10B981] font-bold text-sm">+₹ 2,800 Cr</span>
              </div>
            </div>

            <div className="my-6 border-t border-white/5"></div>

            <h3 className="font-manrope font-bold text-sm mb-4">Strongest Outflow (24H)</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#EF4444]/20 border border-[#EF4444]/50 flex items-center justify-center text-xs font-bold text-[#EF4444]">1</div>
                  <span className="font-semibold text-sm">Auto</span>
                </div>
                <span className="text-[#EF4444] font-bold text-sm">-₹ 1,200 Cr</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
