"use client";

import { Brain, ArrowUpRight, ArrowDownRight, CheckCircle2, Search, ArrowRight, Activity, Bell } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

const niftyData = [
  { time: "10:00", value: 22000 },
  { time: "11:00", value: 22250 },
  { time: "12:00", value: 22180 },
  { time: "13:00", value: 22350 },
  { time: "14:00", value: 22200 },
  { time: "15:00", value: 22500 },
];

const sentimentData = [
  { name: "Bullish", value: 72, color: "#10B981" },
  { name: "Neutral", value: 18, color: "#F59E0B" },
  { name: "Bearish", value: 10, color: "#EF4444" },
];

export default function Dashboard() {
  const [fearGreed, setFearGreed] = useState<{score: number, label: string}>({score: 67, label: "GREED"});
  const [niftyQuote, setNiftyQuote] = useState<any>({ c: 22500.35, dp: 1.20, d: 265.40 });
  const [newsCount, setNewsCount] = useState<number>(1248);

  useEffect(() => {
    // Fetch Fear Greed
    fetch('/api/analytics/signals/fear-greed', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        if(data && data.score) {
          setFearGreed(data);
        }
      })
      .catch(err => console.error("Error fetching FG", err));

    // Fetch News Count
    fetch('/api/data/news/count?hours_back=24', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        if(data && typeof data.count === 'number') setNewsCount(data.count);
      })
      .catch(err => console.error("Error fetching News Count", err));

    // Fetch NIFTY
    fetch('/api/data/fetch/market/^NSEI/quote', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        if(data && data.c) setNiftyQuote(data);
      })
      .catch(err => console.error("Error fetching NIFTY", err));
  }, []);

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto">
      
      {/* Hero Section */}
      <div className="relative glass-panel overflow-hidden p-8 flex items-center justify-between">
        <div className="absolute inset-0 bg-linear-to-r from-indigo-500/10 to-cyan-500/10 pointer-events-none"></div>
        <div className="relative z-10 max-w-2xl">
          <div className="text-sm font-semibold text-amber-400 mb-2 flex items-center gap-2">
            Good Morning, 👋
          </div>
          <h1 className="text-3xl font-manrope font-bold mb-2">
            Welcome to <span className="text-[#00F0FF] neon-text-cyan">Indra-MarketMind</span>
          </h1>
          <p className="text-slate-400 text-sm">
            AI-Powered Financial Intelligence & Market Sentiment Dashboard
          </p>
        </div>
        <div className="relative z-10 hidden md:flex items-center justify-center">
          <div className="relative w-32 h-32">
            <div className="absolute inset-0 bg-[#00F0FF]/20 blur-3xl rounded-full animate-pulse"></div>
            <Brain className="w-full h-full text-[#00F0FF] drop-shadow-[0_0_15px_rgba(0,240,255,0.8)]" strokeWidth={1} />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-px bg-linear-to-r from-transparent via-[#00F0FF] to-transparent"></div>
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-64 h-px bg-linear-to-r from-transparent via-indigo-500 to-transparent"></div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Fear & Greed */}
        <div className="glass-panel p-5 flex flex-col justify-between">
          <div className="text-[11px] font-bold tracking-widest text-slate-400 uppercase mb-4">
            Global Fear & Greed
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-4xl font-manrope font-extrabold text-white mb-2">{fearGreed.score}</div>
              <div className="flex items-center gap-2 text-sm font-semibold text-[#10B981]">
                {fearGreed.label.replace("_", " ")} <span className="bg-[#10B981]/20 px-1.5 py-0.5 rounded text-xs"></span>
              </div>
              <div className="text-xs text-slate-500 mt-2">Dynamic</div>
            </div>
            <div className="relative w-16 h-16">
              {/* Simple CSS gauge representation */}
              <div className="w-full h-full rounded-full border-4 border-slate-800 border-t-[#10B981] border-r-[#10B981] transform rotate-45"></div>
              <div className="absolute inset-0 flex items-center justify-center text-xl text-[#10B981]">😄</div>
            </div>
          </div>
        </div>

        {/* NIFTY 50 */}
        <div className="glass-panel p-5 flex flex-col justify-between border-t border-t-[#00F0FF]/30">
          <div className="flex justify-between items-start mb-4">
            <div className="text-[11px] font-bold tracking-widest text-slate-400 uppercase">NIFTY 50</div>
            <div className="bg-[#00F0FF]/10 text-[#00F0FF] p-1.5 rounded-lg border border-[#00F0FF]/20">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-manrope font-bold text-white mb-1">
              {niftyQuote?.c?.toLocaleString('en-IN', { maximumFractionDigits: 2 }) || '22,500.35'}
            </div>
            <div className={`flex items-center gap-1 text-sm font-semibold mb-2 ${niftyQuote?.dp >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
              {niftyQuote?.dp > 0 ? '+' : ''}{niftyQuote?.d?.toFixed(2)} ({niftyQuote?.dp?.toFixed(2)}%)
              {niftyQuote?.dp >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
            </div>
            <div className="flex items-end justify-between">
              <div className="flex items-center gap-1.5 text-xs text-[#10B981] font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] shadow-[0_0_5px_#10B981]"></span> Live
              </div>
              <div className="w-20 h-8">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={niftyData}>
                    <defs>
                      <linearGradient id="niftyMini" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="value" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#niftyMini)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Articles Scanned */}
        <div className="glass-panel p-5 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="text-[11px] font-bold tracking-widest text-slate-400 uppercase">Articles Scanned (24H)</div>
            <div className="bg-indigo-500/10 text-indigo-400 p-1.5 rounded-lg border border-indigo-500/20">
              <Search className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-manrope font-bold text-white mb-2">{newsCount.toLocaleString()}</div>
            <div className="text-sm text-slate-400 mb-3">Processing...</div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden flex relative">
              <div className="absolute right-0 -top-4 text-[10px] text-slate-500">72%</div>
              <div className="h-full bg-linear-to-r from-indigo-500 to-purple-500 w-[72%] shadow-[0_0_10px_rgba(139,92,246,0.8)]"></div>
            </div>
          </div>
        </div>

        {/* Active AI Models */}
        <div className="glass-panel p-5 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="text-[11px] font-bold tracking-widest text-slate-400 uppercase">Active AI Models</div>
            <div className="bg-amber-500/10 text-amber-500 p-1.5 rounded-lg border border-amber-500/20">
              <Brain className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-manrope font-bold text-white mb-2">5 / 5</div>
            <div className="flex items-center gap-1.5 text-sm font-semibold text-[#10B981]">
              All Healthy <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
        </div>

      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (Chart + Sentiment) - 8 cols */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Market Overview Chart */}
          <div className="glass-panel p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-manrope font-bold text-lg">Market Overview</h2>
              <div className="flex items-center gap-4 text-xs font-medium">
                <span className="text-slate-400">Nifty 50</span>
                <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
                <div className="flex bg-slate-800 rounded-lg p-0.5 border border-white/5">
                  <button className="px-3 py-1 bg-indigo-500 rounded-md text-white shadow-lg">1D</button>
                  <button className="px-3 py-1 text-slate-400 hover:text-white">1W</button>
                  <button className="px-3 py-1 text-slate-400 hover:text-white">1M</button>
                  <button className="px-3 py-1 text-slate-400 hover:text-white">3M</button>
                  <button className="px-3 py-1 text-slate-400 hover:text-white">1Y</button>
                  <button className="px-3 py-1 text-slate-400 hover:text-white">All</button>
                </div>
              </div>
            </div>

            <div className="h-75 w-full mb-6 relative">
              {/* Target Price Bubble */}
              <div className="absolute right-0 top-1/4 bg-[#10B981] text-black text-xs font-bold px-2 py-1 rounded shadow-lg z-10 transform translate-x-2">
                22,500.35
              </div>
              
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={niftyData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="niftyGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="time" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748B', fontSize: 12 }} 
                    dy={10} 
                  />
                  <YAxis 
                    domain={['dataMin - 100', 'dataMax + 100']} 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748B', fontSize: 12 }}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0F172A', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                    itemStyle={{ color: '#F8FAFC' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#10B981" 
                    strokeWidth={2} 
                    fill="url(#niftyGradient)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Bottom Stats & Top Movers */}
            <div className="flex items-start justify-between border-t border-white/5 pt-5 mt-5">
              <div className="flex gap-8">
                <div><div className="text-[10px] text-slate-500 font-bold mb-1 uppercase">Open</div><div className="font-semibold text-sm">22,250.10</div></div>
                <div><div className="text-[10px] text-slate-500 font-bold mb-1 uppercase">High</div><div className="font-semibold text-sm text-[#10B981]">22,535.80</div></div>
                <div><div className="text-[10px] text-slate-500 font-bold mb-1 uppercase">Low</div><div className="font-semibold text-sm text-[#EF4444]">22,180.45</div></div>
                <div><div className="text-[10px] text-slate-500 font-bold mb-1 uppercase">Prev. Close</div><div className="font-semibold text-sm">22,234.95</div></div>
                <div><div className="text-[10px] text-slate-500 font-bold mb-1 uppercase">Volume</div><div className="font-semibold text-sm">215.42M</div></div>
              </div>

              <div className="flex gap-8">
                <div>
                  <div className="text-[10px] text-[#10B981] font-bold mb-2 uppercase">Top Gainers</div>
                  <div className="flex items-center gap-2 text-xs font-semibold bg-white/5 px-2 py-1 rounded">
                    <span className="w-4 h-4 bg-blue-600 rounded flex items-center justify-center text-[8px] text-white">T</span>
                    TATASTEEL <span className="text-slate-400 font-normal">158.45</span> <span className="text-[#10B981]">+3.45%</span>
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-[#EF4444] font-bold mb-2 uppercase">Top Losers</div>
                  <div className="flex items-center gap-2 text-xs font-semibold bg-white/5 px-2 py-1 rounded">
                    <span className="w-4 h-4 bg-red-600 rounded flex items-center justify-center text-[8px] text-white">A</span>
                    ADANIENT <span className="text-slate-400 font-normal">2,340.20</span> <span className="text-[#EF4444]">-2.15%</span>
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-[#00F0FF] font-bold mb-2 uppercase">Most Active</div>
                  <div className="flex items-center gap-2 text-xs font-semibold bg-white/5 px-2 py-1 rounded">
                    <span className="w-4 h-4 bg-blue-800 rounded flex items-center justify-center text-[8px] text-white">R</span>
                    RELIANCE <span className="text-slate-400 font-normal">2,850.50</span> <span className="text-[#10B981]">+1.28%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sentiment Section Split */}
          <div className="grid grid-cols-2 gap-6">
            
            {/* Overall Sentiment Half Donut */}
            <div className="glass-panel p-6 flex flex-col items-center relative overflow-hidden">
              <h3 className="w-full font-manrope font-bold text-sm mb-6 text-left">Overall Market Sentiment</h3>
              <div className="relative w-48 h-24 overflow-hidden mb-2">
                {/* SVG Half Donut */}
                <svg viewBox="0 0 100 50" className="w-full h-full overflow-visible">
                  <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="12" strokeLinecap="round" />
                  <path d="M 10 50 A 40 40 0 0 1 75 15" fill="none" stroke="#10B981" strokeWidth="12" strokeLinecap="round" className="drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                </svg>
                <div className="absolute bottom-0 left-0 text-[10px] text-slate-500 font-bold">0</div>
                <div className="absolute bottom-0 right-0 text-[10px] text-slate-500 font-bold">100</div>
                
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex flex-col items-center">
                  <div className="text-sm font-bold text-[#10B981] mb-1">Bullish</div>
                  <div className="text-3xl font-manrope font-extrabold text-white">
                    72<span className="text-sm text-slate-500 font-medium"> / 100</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Sentiment Distribution Pie & Alert */}
            <div className="glass-panel p-6 flex flex-col justify-between">
              <h3 className="font-manrope font-bold text-sm mb-4">Sentiment Distribution</h3>
              <div className="flex items-center gap-6 mb-4">
                <div className="w-24 h-24">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={sentimentData}
                        cx="50%"
                        cy="50%"
                        innerRadius={25}
                        outerRadius={40}
                        stroke="none"
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {sentimentData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-3 flex-1">
                  {sentimentData.map((d) => (
                    <div key={d.name} className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-sm" style={{ backgroundColor: d.color }}></span>
                        <span className="text-slate-300">{d.name}</span>
                      </div>
                      <span className="font-semibold">{d.value}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mini Alert Box */}
              <div className="bg-[#10B981]/10 border border-[#10B981]/20 rounded-lg p-3 flex items-start gap-3">
                <div className="p-1 bg-[#10B981]/20 text-[#10B981] rounded mt-0.5">
                  <ArrowUpRight className="w-3 h-3" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-white">Market sentiment is positive</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">AI Confidence: <span className="text-[#10B981]">High</span></div>
                </div>
              </div>

            </div>

          </div>
        </div>

        {/* Right Column (Indices + News) - 4 cols */}
        <div className="lg:col-span-4 space-y-6 flex flex-col">
          
          {/* Major Indices */}
          <div className="glass-panel p-5 flex-1">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-manrope font-bold text-sm">Major Indices</h3>
              <button className="text-[11px] text-indigo-400 font-semibold hover:text-indigo-300 transition-colors">View All</button>
            </div>
            
            <div className="space-y-4">
              {[
                { name: "NIFTY 50", val: "22,500.35", chg: "+1.20%", up: true, label: "NIF" },
                { name: "SENSEX", val: "74,169.95", chg: "+1.18%", up: true, label: "BSE" },
                { name: "NASDAQ", val: "16,745.30", chg: "+0.85%", up: true, label: "NDQ" },
                { name: "DOW JONES", val: "39,935.07", chg: "+0.60%", up: true, label: "DOW" },
                { name: "BITCOIN", val: "$64,250.80", chg: "-1.35%", up: false, label: "BTC" },
              ].map((idx, i) => (
                <div key={i} className="flex items-center justify-between pb-3 border-b border-white/5 last:border-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[8px] font-bold">
                      {idx.label}
                    </div>
                    <div>
                      <div className="text-xs font-semibold">{idx.name}</div>
                      <div className={cn("text-[10px] font-semibold mt-0.5", idx.up ? "text-[#10B981]" : "text-[#EF4444]")}>
                        {idx.chg}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-xs font-bold">{idx.val}</div>
                    {/* Mini Sparkline svg mock */}
                    <svg width="40" height="15" viewBox="0 0 40 15">
                      <path d={idx.up ? "M0,10 Q10,15 20,5 T40,2" : "M0,5 Q10,2 20,10 T40,12"} fill="none" stroke={idx.up ? "#10B981" : "#EF4444"} strokeWidth="1.5" />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Live News & Sentiment */}
          <div className="glass-panel p-5 flex-1">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-manrope font-bold text-sm">Live News & Sentiment</h3>
              <button className="text-[11px] text-indigo-400 font-semibold hover:text-indigo-300 transition-colors">View All</button>
            </div>

            <div className="space-y-5">
              {[
                { src: "Reuters", time: "2m ago", title: "RBI keeps repo rate unchanged, signals focus on growth", sent: 0.74, tag: "Bullish", color: "#10B981" },
                { src: "Bloomberg", time: "8m ago", title: "Global markets mixed as investors await US CPI data", sent: 0.46, tag: "Neutral", color: "#F59E0B" },
                { src: "CNBC", time: "15m ago", title: "Oil prices fall on demand concerns, China data disappoints", sent: -0.62, tag: "Bearish", color: "#EF4444" }
              ].map((n, i) => (
                <div key={i} className="relative pl-3 border-l-2" style={{ borderColor: n.color }}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium">
                      <div className="w-3 h-3 bg-white/20 rounded-full flex items-center justify-center text-[6px] text-white font-bold">{n.src[0]}</div>
                      {n.src} <span className="w-1 h-1 bg-slate-600 rounded-full"></span> {n.time}
                    </div>
                    <div className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ color: n.color, backgroundColor: `${n.color}20` }}>
                      {n.tag}
                    </div>
                  </div>
                  <div className="text-xs font-medium leading-relaxed mb-2">{n.title}</div>
                  <div className="flex items-center gap-2">
                    <div className="text-[9px] text-slate-500">Sentiment Score: <span style={{ color: n.color }}>{n.sent > 0 ? `+${n.sent}` : n.sent}</span></div>
                    <div className="flex-1 h-1 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full" style={{ width: `${Math.abs(n.sent)*100}%`, backgroundColor: n.color }}></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button className="w-full mt-5 py-2 border border-indigo-500/30 text-indigo-400 text-xs font-semibold rounded-lg hover:bg-indigo-500/10 transition-colors flex items-center justify-center gap-2">
              View All News <ArrowRight className="w-3 h-3" />
            </button>
          </div>

        </div>
      </div>

      {/* Bottom Alert Banner */}
      <div className="bg-[#10B981]/10 border border-[#10B981]/30 rounded-xl p-4 flex items-center gap-4 relative overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#10B981] shadow-[0_0_10px_#10B981]"></div>
        <div className="w-8 h-8 rounded-full bg-[#10B981] flex items-center justify-center">
          <Bell className="w-4 h-4 text-black" fill="currentColor" />
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-bold text-[#10B981] mb-0.5">Bullish Alert</h4>
          <p className="text-xs text-slate-300">Market sentiment has turned more positive in the last 2 hours. NIFTY 50 is showing strength.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-slate-400">3m ago</span>
          <button className="text-slate-400 hover:text-white transition-colors">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>
      </div>

    </div>
  );
}
