"use client";

import { motion } from "framer-motion";
import { Search, Rss, ArrowUpRight, ArrowDownRight, Filter, Clock } from "lucide-react";

const newsItems = [
  { id: 1, source: "Bloomberg", time: "2 min ago", title: "Federal Reserve signals potential rate cut in upcoming meeting", sentiment: "Bullish", score: "+0.85", content: "The Federal Reserve indicated strong willingness to ease monetary policy due to cooling inflation..." },
  { id: 2, source: "Reuters", time: "12 min ago", title: "Tech stocks rally as AI chip demand surges", sentiment: "Bullish", score: "+0.92", content: "Major semiconductor manufacturers reported unexpected surges in quarterly orders for AI accelerators..." },
  { id: 3, source: "CNBC", time: "18 min ago", title: "Oil prices dip on weakened China manufacturing data", sentiment: "Bearish", score: "-0.65", content: "Crude oil futures fell 2% early Monday after China reported a third straight month of contraction..." },
  { id: 4, source: "WSJ", time: "34 min ago", title: "Banking sector faces new regulatory hurdles", sentiment: "Bearish", score: "-0.40", content: "New capital requirements proposed by the SEC could force major banks to increase reserves..." },
  { id: 5, source: "Financial Times", time: "1 hour ago", title: "European markets open flat ahead of ECB decision", sentiment: "Neutral", score: "+0.10", content: "European equities showed little movement in early trading as investors await guidance from the ECB..." },
  { id: 6, source: "MarketWatch", time: "1.5 hours ago", title: "Retail sales exceed expectations in surprising twist", sentiment: "Bullish", score: "+0.70", content: "Consumer spending proved resilient last month, defying economist expectations of a slowdown..." },
];

export default function LiveFeed() {
  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="glass-panel p-8 relative overflow-hidden flex justify-between items-center">
        <div className="absolute inset-0 bg-linear-to-r from-[#00F0FF]/10 to-indigo-500/10 pointer-events-none"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-[#00F0FF]/10 text-[#00F0FF] rounded-lg border border-[#00F0FF]/20">
              <Rss className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-manrope font-bold">Live AI News Feed</h1>
          </div>
          <p className="text-slate-400 text-sm">Real-time market news processed by Indra NLP</p>
        </div>

        {/* Processing Animation */}
        <div className="relative z-10 flex flex-col items-end">
          <div className="flex items-center gap-2 text-xs font-bold text-[#00F0FF] mb-2">
            <span className="w-2 h-2 rounded-full bg-[#00F0FF] animate-ping"></span>
            INGESTING LIVE DATA
          </div>
          <div className="text-[10px] text-slate-500 font-mono">1,248 articles scanned (24H)</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 overflow-x-auto custom-scrollbar pb-2">
        {["All Sources", "Equities", "Forex", "Crypto", "Macro", "Earnings"].map((f, i) => (
          <button key={i} className={`whitespace-nowrap px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${i === 0 ? "bg-[#00F0FF]/10 text-[#00F0FF] border border-[#00F0FF]/30" : "bg-white/5 text-slate-400 hover:text-white border border-white/5"}`}>
            {f}
          </button>
        ))}
      </div>

      {/* Feed Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Main Feed */}
        <div className="lg:col-span-8 space-y-4">
          {newsItems.map((item, index) => (
            <motion.div 
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass-panel p-6 relative overflow-hidden group"
            >
              {/* Highlight bar */}
              <div className={`absolute left-0 top-0 bottom-0 w-1 ${item.sentiment === 'Bullish' ? 'bg-[#10B981]' : item.sentiment === 'Bearish' ? 'bg-[#EF4444]' : 'bg-[#F59E0B]'}`}></div>
              
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3 text-xs text-slate-400 font-medium">
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-white/5 rounded">
                    <div className="w-3 h-3 bg-white/20 rounded-full flex items-center justify-center text-[6px] text-white font-bold">{item.source[0]}</div>
                    {item.source}
                  </div>
                  <div className="flex items-center gap-1"><Clock className="w-3 h-3"/> {item.time}</div>
                </div>
                
                <div className={`flex items-center gap-2 px-2.5 py-1 rounded-md text-[10px] font-bold ${
                  item.sentiment === 'Bullish' ? 'bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20' : 
                  item.sentiment === 'Bearish' ? 'bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20' : 
                  'bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20'
                }`}>
                  {item.sentiment === 'Bullish' && <ArrowUpRight className="w-3 h-3" />}
                  {item.sentiment === 'Bearish' && <ArrowDownRight className="w-3 h-3" />}
                  {item.sentiment} {item.score}
                </div>
              </div>

              <h2 className="text-lg font-bold text-white mb-2 group-hover:text-[#00F0FF] transition-colors cursor-pointer">{item.title}</h2>
              <p className="text-sm text-slate-400 leading-relaxed mb-4">{item.content}</p>

              {/* Tags */}
              <div className="flex gap-2">
                <span className="text-[10px] px-2 py-1 bg-indigo-500/10 text-indigo-400 rounded border border-indigo-500/20">#Macro</span>
                <span className="text-[10px] px-2 py-1 bg-indigo-500/10 text-indigo-400 rounded border border-indigo-500/20">#Rates</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Right Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Trending Topics */}
          <div className="glass-panel p-5">
            <h3 className="font-manrope font-bold text-sm mb-4">Trending Topics</h3>
            <div className="flex flex-wrap gap-2">
              {["Inflation", "AI Chips", "Rate Cuts", "China Data", "ECB", "Retail Sales"].map((tag, i) => (
                <div key={i} className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-xs font-semibold text-slate-300 hover:bg-white/10 cursor-pointer transition-colors">
                  {tag}
                </div>
              ))}
            </div>
          </div>

          {/* AI NLP Diagnostics */}
          <div className="glass-panel p-5">
            <h3 className="font-manrope font-bold text-sm mb-4 flex items-center gap-2">
              <Search className="w-4 h-4 text-[#00F0FF]" /> NLP Diagnostics
            </h3>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Semantic Accuracy</span>
                  <span className="text-[#10B981] font-bold">98.4%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-[#10B981] w-[98.4%]"></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Processing Latency</span>
                  <span className="text-amber-400 font-bold">42ms</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-400 w-[20%]"></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Sentiment Engine</span>
                  <span className="text-[#00F0FF] font-bold">V4 Active</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-[#00F0FF] w-full"></div>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
