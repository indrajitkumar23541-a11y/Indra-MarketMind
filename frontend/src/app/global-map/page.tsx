"use client";

import { motion } from "framer-motion";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";
import { Activity, TrendingUp, TrendingDown, Globe2 } from "lucide-react";
import { cn } from "@/lib/utils";

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const markers = [
  { name: "New York (NYSE)", coordinates: [-74.006, 40.7128] as [number, number], status: "open", sentiment: "bullish", value: "+1.2%" },
  { name: "London (LSE)", coordinates: [-0.1276, 51.5072] as [number, number], status: "open", sentiment: "neutral", value: "+0.1%" },
  { name: "Tokyo (TSE)", coordinates: [139.6917, 35.6895] as [number, number], status: "closed", sentiment: "bearish", value: "-0.8%" },
  { name: "Mumbai (NSE)", coordinates: [72.8777, 19.0760] as [number, number], status: "open", sentiment: "bullish", value: "+1.5%" },
  { name: "Hong Kong (HKEX)", coordinates: [114.1694, 22.3193] as [number, number], status: "closed", sentiment: "bearish", value: "-1.2%" },
];

export default function GlobalMap() {
  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="glass-panel p-8 relative overflow-hidden flex justify-between items-center">
        <div className="absolute inset-0 bg-linear-to-r from-blue-500/10 to-purple-500/10 pointer-events-none"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg border border-blue-500/20">
              <Globe2 className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-manrope font-bold">Global Markets Map</h1>
          </div>
          <p className="text-slate-400 text-sm">Real-time status of major stock exchanges worldwide</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Map Container */}
        <div className="lg:col-span-9 glass-panel p-6 relative overflow-hidden">
          {/* Overlay grid styling */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[24px_24px] pointer-events-none"></div>
          
          <div className="w-full h-125 relative z-10 flex items-center justify-center">
            <ComposableMap 
              projection="geoMercator" 
              projectionConfig={{ scale: 120 }}
              className="w-full h-full opacity-80"
            >
              <Geographies geography={geoUrl}>
                {({ geographies }) =>
                  geographies.map((geo) => (
                    <Geography 
                      key={geo.rsmKey} 
                      geography={geo} 
                      fill="#0F172A" 
                      stroke="#1E293B"
                      strokeWidth={0.5}
                      style={{
                        default: { outline: "none" },
                        hover: { fill: "#1E293B", outline: "none" },
                        pressed: { fill: "#1E293B", outline: "none" },
                      }}
                    />
                  ))
                }
              </Geographies>
              
              {markers.map(({ name, coordinates, status, sentiment }) => (
                <Marker key={name} coordinates={coordinates}>
                  <g transform="translate(-12, -24)">
                    <motion.circle 
                      cx="12" cy="12" r="8" 
                      fill={status === "open" ? (sentiment === "bullish" ? "#10B981" : sentiment === "bearish" ? "#EF4444" : "#F59E0B") : "#475569"} 
                      initial={{ scale: 0.8, opacity: 0.5 }}
                      animate={status === "open" ? { scale: [0.8, 1.2, 0.8], opacity: [0.5, 1, 0.5] } : {}}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      className="drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                    />
                    <circle 
                      cx="12" cy="12" r="4" 
                      fill="#ffffff"
                    />
                    <text textAnchor="middle" y="32" x="12" fill="#F8FAFC" fontSize="10px" className="font-bold drop-shadow-md">
                      {name.split(" ")[0]}
                    </text>
                  </g>
                </Marker>
              ))}
            </ComposableMap>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="lg:col-span-3 space-y-6">
          <div className="glass-panel p-5">
            <h3 className="font-manrope font-bold text-sm mb-4">Market Status</h3>
            
            <div className="space-y-4">
              {markers.map((market, idx) => (
                <div key={idx} className="flex flex-col gap-1 pb-3 border-b border-white/5 last:border-0 last:pb-0">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-white">{market.name}</span>
                    <span className={cn(
                      "text-[9px] px-1.5 py-0.5 rounded font-bold uppercase",
                      market.status === "open" ? "bg-green-500/20 text-green-400 border border-green-500/30" : "bg-slate-800 text-slate-400 border border-slate-700"
                    )}>
                      {market.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-[10px] text-slate-400">Index Perf:</span>
                    <span className={cn(
                      "text-xs font-bold flex items-center gap-1",
                      market.sentiment === "bullish" ? "text-green-400" : market.sentiment === "bearish" ? "text-red-400" : "text-amber-400"
                    )}>
                      {market.value}
                      {market.sentiment === "bullish" ? <TrendingUp className="w-3 h-3" /> : market.sentiment === "bearish" ? <TrendingDown className="w-3 h-3" /> : <Activity className="w-3 h-3" />}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
