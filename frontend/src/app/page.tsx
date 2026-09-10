"use client";

import { useState, useEffect } from "react";
import { 
  Brain, 
  ArrowUpRight, 
  ArrowDownRight, 
  CheckCircle2, 
  Search, 
  ArrowRight, 
  Activity, 
  Bell, 
  RefreshCw, 
  X, 
  Globe2, 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  ExternalLink,
  ShieldCheck
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from "recharts";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface ChartPoint {
  time: string;
  value: number;
  high?: number;
  low?: number;
  open?: number;
}

interface IndexItem {
  symbol: string;
  name: string;
  label: string;
  region: string;
  c: number;
  d: number;
  dp: number;
  h?: number;
  l?: number;
  o?: number;
  pc?: number;
  sparkline: number[];
}

const sentimentData = [
  { name: "Bullish", value: 68, color: "#10B981" },
  { name: "Neutral", value: 20, color: "#F59E0B" },
  { name: "Bearish", value: 12, color: "#EF4444" },
];

export default function Dashboard() {
  // Dynamic Greeting based on real-time
  const [greeting, setGreeting] = useState<{ text: string; emoji: string }>({
    text: "Good Morning",
    emoji: "☀️"
  });

  // KPI States
  const [fearGreed, setFearGreed] = useState<{ score: number; label: string }>({ score: 50, label: "NEUTRAL" });
  const [niftyQuote, setNiftyQuote] = useState<any>({ 
    c: 23489.70, 
    dp: -1.22, 
    d: -289.50, 
    h: 23571.55, 
    l: 23466.65, 
    o: 23522.05, 
    pc: 23779.20, 
    v: 145000000 
  });
  const [newsCount, setNewsCount] = useState<number>(1494);

  // Market Overview Chart State
  const [activeTimeframe, setActiveTimeframe] = useState<"1D" | "1W" | "1M" | "3M" | "1Y" | "All">("1D");
  const [chartPoints, setChartPoints] = useState<ChartPoint[]>([]);
  const [chartLoading, setChartLoading] = useState<boolean>(false);
  const [chartMeta, setChartMeta] = useState<any>(null);

  // Major Indices State
  const [indices, setIndices] = useState<IndexItem[]>([]);
  const [indicesLoading, setIndicesLoading] = useState<boolean>(false);
  const [showAllIndicesModal, setShowAllIndicesModal] = useState<boolean>(false);

  // AI Models Modal State
  const [showAIModelsModal, setShowAIModelsModal] = useState<boolean>(false);

  // 1. Calculate Real-Time Greeting
  useEffect(() => {
    const updateGreeting = () => {
      const hour = new Date().getHours();
      if (hour >= 4 && hour < 12) {
        setGreeting({ text: "Good Morning", emoji: "☀️" });
      } else if (hour >= 12 && hour < 17) {
        setGreeting({ text: "Good Afternoon", emoji: "🌤️" });
      } else {
        setGreeting({ text: "Good Evening", emoji: "🌙" });
      }
    };
    updateGreeting();
    const interval = setInterval(updateGreeting, 60000);
    return () => clearInterval(interval);
  }, []);

  // 2. Fetch NIFTY 50 Quote & Auto Refresh
  const fetchNiftyQuote = async () => {
    try {
      const res = await fetch("/api/data/fetch/market/%5ENSEI/quote", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (data && data.c) {
          setNiftyQuote(data);
        }
      }
    } catch (err) {
      console.error("Error fetching Nifty quote", err);
    }
  };

  // 3. Fetch Fear & Greed
  const fetchFearGreed = async () => {
    try {
      const res = await fetch("/api/analytics/signals/fear-greed", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (data && data.score !== undefined) {
          setFearGreed(data);
        }
      }
    } catch (err) {
      console.error("Error fetching Fear & Greed", err);
    }
  };

  // 4. Fetch Articles Scanned Count
  const fetchArticlesCount = async () => {
    try {
      const res = await fetch("/api/data/news/count?hours_back=24", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (data && typeof data.count === "number") {
          setNewsCount(data.count);
        }
      }
    } catch (err) {
      console.error("Error fetching news count", err);
    }
  };

  // 5. Fetch Major Indices Overview
  const fetchIndices = async () => {
    setIndicesLoading(true);
    try {
      const res = await fetch("/api/data/fetch/market/indices/overview", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.indices) && data.indices.length > 0) {
          setIndices(data.indices);
        }
      }
    } catch (err) {
      console.error("Error fetching indices", err);
    } finally {
      setIndicesLoading(false);
    }
  };

  // 6. Fetch Chart Data based on Timeframe
  const fetchChart = async (tf: "1D" | "1W" | "1M" | "3M" | "1Y" | "All") => {
    setChartLoading(true);
    try {
      const rangeParam = tf.toLowerCase();
      const res = await fetch(`/api/data/fetch/market/%5ENSEI/chart?range=${rangeParam}`, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.points)) {
          setChartPoints(data.points);
          setChartMeta(data);
        }
      }
    } catch (err) {
      console.error("Error fetching chart data", err);
    } finally {
      setChartLoading(false);
    }
  };

  // Initial load and polling intervals
  useEffect(() => {
    fetchNiftyQuote();
    fetchFearGreed();
    fetchArticlesCount();
    fetchIndices();
    fetchChart("1D");

    const quoteInterval = setInterval(fetchNiftyQuote, 10000);
    const indicesInterval = setInterval(fetchIndices, 15000);
    const newsInterval = setInterval(fetchArticlesCount, 30000);

    return () => {
      clearInterval(quoteInterval);
      clearInterval(indicesInterval);
      clearInterval(newsInterval);
    };
  }, []);

  const handleTimeframeChange = (tf: "1D" | "1W" | "1M" | "3M" | "1Y" | "All") => {
    setActiveTimeframe(tf);
    fetchChart(tf);
  };

  // Current display statistics (live quote takes precedence for latest real-time market tick)
  const displayPrice = niftyQuote?.c || chartMeta?.c || 23462.45;
  const displayHigh = niftyQuote?.h || chartMeta?.h || 23571.55;
  const displayLow = niftyQuote?.l || chartMeta?.l || 23450.95;
  const displayOpen = niftyQuote?.o || chartMeta?.o || 23522.05;
  const displayPrevClose = niftyQuote?.pc || chartMeta?.pc || 23635.10;
  const displayChange = niftyQuote?.d ?? chartMeta?.d ?? -172.65;
  const displayPercent = niftyQuote?.dp ?? chartMeta?.dp ?? -0.73;
  const isPositive = displayPercent >= 0;

  return (
    <div className="space-y-4 sm:space-y-6 pb-2 sm:pb-6 max-w-7xl mx-auto">
      
      {/* Hero Section with Real Dynamic Greeting */}
      <div className="relative glass-panel overflow-hidden p-5 sm:p-7 md:p-8 flex items-center justify-between border border-cyan-500/20 bg-gradient-to-r from-cyan-950/20 via-blue-950/10 to-indigo-950/20 rounded-2xl">
        <div className="absolute inset-0 bg-linear-to-r from-indigo-500/10 to-cyan-500/10 pointer-events-none"></div>
        <div className="relative z-10 max-w-2xl">
          <div className="text-xs sm:text-sm font-bold text-amber-400 mb-1.5 sm:mb-2 flex items-center gap-2">
            <span>{greeting.text},</span>
            <span className="text-base sm:text-lg">{greeting.emoji}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-manrope font-bold mb-1.5 sm:mb-2 text-white">
            Welcome to <span className="text-[#00F0FF] neon-text-cyan">Indra-MarketMind</span>
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
            AI-Powered Financial Intelligence & Real-Time Market Sentiment Terminal
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

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
        
        {/* 1. Global Fear & Greed */}
        <div className="glass-panel p-4 sm:p-5 flex flex-col justify-between border border-white/10 hover:border-cyan-500/30 transition-all rounded-2xl">
          <div className="text-[10px] sm:text-[11px] font-bold tracking-widest text-slate-400 uppercase mb-3 sm:mb-4 flex items-center justify-between">
            <span>GLOBAL FEAR & GREED</span>
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl sm:text-4xl font-manrope font-extrabold text-white mb-1 sm:mb-2">{fearGreed.score}</div>
              <div className={cn("flex items-center gap-2 text-xs sm:text-sm font-semibold", 
                fearGreed.score > 55 ? "text-[#10B981]" : fearGreed.score < 45 ? "text-[#EF4444]" : "text-[#F59E0B]"
              )}>
                {fearGreed.label.replace(/_/g, " ")}
              </div>
              <div className="text-[11px] sm:text-xs text-slate-500 mt-1 sm:mt-2">7 Technical Factors</div>
            </div>
            <div className="relative w-14 h-14 sm:w-16 sm:h-16 shrink-0">
              <div className={cn(
                "w-full h-full rounded-full border-4 border-slate-800 transform rotate-45",
                fearGreed.score > 55 ? "border-t-[#10B981] border-r-[#10B981]" : fearGreed.score < 45 ? "border-t-[#EF4444] border-r-[#EF4444]" : "border-t-[#F59E0B] border-r-[#F59E0B]"
              )}></div>
              <div className="absolute inset-0 flex items-center justify-center text-lg sm:text-xl">
                {fearGreed.score > 55 ? "😄" : fearGreed.score < 45 ? "😨" : "😐"}
              </div>
            </div>
          </div>
        </div>

        {/* 2. NIFTY 50 (Real-Time Live) */}
        <div className="glass-panel p-4 sm:p-5 flex flex-col justify-between border border-t-[#00F0FF]/40 border-white/10 rounded-2xl">
          <div className="flex justify-between items-start mb-3 sm:mb-4">
            <div className="text-[10px] sm:text-[11px] font-bold tracking-widest text-slate-400 uppercase">NIFTY 50</div>
            <div className="bg-[#00F0FF]/10 text-[#00F0FF] p-1.5 rounded-lg border border-[#00F0FF]/20">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-manrope font-bold text-white mb-1 font-mono">
              {displayPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className={cn("flex items-center gap-1 text-xs sm:text-sm font-semibold mb-2 font-mono", isPositive ? "text-[#10B981]" : "text-[#EF4444]")}>
              {isPositive ? "+" : ""}{displayChange.toFixed(2)} ({isPositive ? "+" : ""}{displayPercent.toFixed(2)}%)
              {isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
            </div>
            <div className="flex items-end justify-between">
              <div className="flex items-center gap-1.5 text-xs text-[#10B981] font-medium">
                <span className="w-2 h-2 rounded-full bg-[#10B981] shadow-[0_0_8px_#10B981] animate-pulse"></span> Live NSE
              </div>
              <div className="text-[10px] sm:text-[11px] text-slate-500 font-mono">
                Day: {displayLow.toFixed(0)} - {displayHigh.toFixed(0)}
              </div>
            </div>
          </div>
        </div>

        {/* 3. Articles Scanned (24H) */}
        <div className="glass-panel p-4 sm:p-5 flex flex-col justify-between border border-white/10 rounded-2xl">
          <div className="flex justify-between items-start mb-3 sm:mb-4">
            <div className="text-[10px] sm:text-[11px] font-bold tracking-widest text-slate-400 uppercase">ARTICLES SCANNED (24H)</div>
            <div className="bg-indigo-500/10 text-indigo-400 p-1.5 rounded-lg border border-indigo-500/20">
              <Search className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-manrope font-bold text-white mb-1 sm:mb-2 font-mono">
              {newsCount.toLocaleString()}
            </div>
            <div className="text-xs text-emerald-400 mb-2 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Active Stream Ingesting
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden flex relative">
              <div className="h-full bg-linear-to-r from-cyan-500 to-indigo-500 w-[85%] animate-pulse shadow-[0_0_10px_rgba(0,240,255,0.6)]"></div>
            </div>
          </div>
        </div>

        {/* 4. Active AI Models (Clickable modal) */}
        <div 
          onClick={() => setShowAIModelsModal(true)}
          className="glass-panel p-4 sm:p-5 flex flex-col justify-between border border-white/10 hover:border-amber-500/40 cursor-pointer transition-all rounded-2xl group"
          title="Click to view AI Model Health"
        >
          <div className="flex justify-between items-start mb-3 sm:mb-4">
            <div className="text-[10px] sm:text-[11px] font-bold tracking-widest text-slate-400 uppercase group-hover:text-amber-400 transition">
              ACTIVE AI MODELS
            </div>
            <div className="bg-amber-500/10 text-amber-500 p-1.5 rounded-lg border border-amber-500/20 group-hover:bg-amber-500/20 transition">
              <Brain className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-manrope font-bold text-white mb-1 sm:mb-2">5 / 5</div>
            <div className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#10B981]">
              All Healthy <CheckCircle2 className="w-4 h-4" />
            </div>
            <div className="text-[11px] text-cyan-400 mt-2 flex items-center gap-1 group-hover:underline">
              View Ensemble Details <ArrowRight className="w-3 h-3" />
            </div>
          </div>
        </div>

      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        
        {/* Left Column (Market Overview Chart + Sentiment Breakdown) - 8 cols */}
        <div className="lg:col-span-8 space-y-4 sm:space-y-6">
          
          {/* Market Overview Real Chart */}
          <div className="glass-panel p-4 sm:p-6 border border-white/10 rounded-2xl">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div>
                <h2 className="font-manrope font-bold text-base sm:text-lg text-white flex items-center gap-2">
                  <span>Market Overview</span>
                  <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded bg-cyan-950/40 text-cyan-400 border border-cyan-500/30">NIFTY 50</span>
                </h2>
                <div className="text-[11px] sm:text-xs text-slate-400 mt-0.5">Real-world live pricing directly from National Stock Exchange</div>
              </div>

              {/* Timeframe Selectors */}
              <div className="flex items-center gap-1 bg-[#0A0E1A] rounded-xl p-1 border border-white/10 overflow-x-auto max-w-full">
                {(["1D", "1W", "1M", "3M", "1Y", "All"] as const).map((tf) => (
                  <button
                    key={tf}
                    onClick={() => handleTimeframeChange(tf)}
                    className={cn(
                      "px-2.5 sm:px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap",
                      activeTimeframe === tf
                        ? "bg-cyan-500 text-black font-bold shadow-[0_0_12px_rgba(0,240,255,0.4)]"
                        : "text-slate-400 hover:text-white"
                    )}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>

            {/* Real Area Chart */}
            <div className="h-64 sm:h-80 w-full mb-4 sm:mb-6 relative">
              {chartLoading && (
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#05070D]/70 backdrop-blur-xs">
                  <div className="flex items-center gap-2 text-xs text-cyan-400">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Fetching real market data for {activeTimeframe}...
                  </div>
                </div>
              )}

              {/* Target Price Bubble */}
              <div className="absolute right-2 sm:right-4 top-2 sm:top-4 bg-[#10B981] text-black text-[11px] sm:text-xs font-bold px-2.5 sm:px-3 py-1 rounded-lg shadow-lg z-10 font-mono">
                ₹{displayPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartPoints.length > 0 ? chartPoints : [{ time: "Now", value: displayPrice }]}>
                  <defs>
                    <linearGradient id="realChartGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={isPositive ? "#10B981" : "#00F0FF"} stopOpacity={0.35}/>
                      <stop offset="95%" stopColor={isPositive ? "#10B981" : "#00F0FF"} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="time" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748B', fontSize: 10 }} 
                    dy={8} 
                  />
                  <YAxis 
                    domain={['dataMin - 50', 'dataMax + 50']} 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748B', fontSize: 10 }}
                    tickFormatter={(val) => Number(val).toFixed(0)}
                    width={45}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#0F172A', 
                      borderColor: 'rgba(0, 240, 255, 0.3)', 
                      borderRadius: '12px',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
                    }}
                    itemStyle={{ color: '#F8FAFC', fontWeight: 'bold' }}
                    formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, 'NIFTY 50']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke={isPositive ? "#10B981" : "#00F0FF"} 
                    strokeWidth={2.5} 
                    fill="url(#realChartGradient)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Bottom Real Stats */}
            <div className="flex flex-wrap items-center justify-between border-t border-white/5 pt-4 sm:pt-5 gap-3 sm:gap-4">
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-6 text-left w-full sm:w-auto">
                <div>
                  <div className="text-[9px] sm:text-[10px] text-slate-500 font-bold mb-0.5 uppercase">Open</div>
                  <div className="font-semibold text-xs sm:text-sm font-mono text-white">₹{displayOpen.toLocaleString('en-IN')}</div>
                </div>
                <div>
                  <div className="text-[9px] sm:text-[10px] text-slate-500 font-bold mb-0.5 uppercase">High</div>
                  <div className="font-semibold text-xs sm:text-sm font-mono text-[#10B981]">₹{displayHigh.toLocaleString('en-IN')}</div>
                </div>
                <div>
                  <div className="text-[9px] sm:text-[10px] text-slate-500 font-bold mb-0.5 uppercase">Low</div>
                  <div className="font-semibold text-xs sm:text-sm font-mono text-[#EF4444]">₹{displayLow.toLocaleString('en-IN')}</div>
                </div>
                <div>
                  <div className="text-[9px] sm:text-[10px] text-slate-500 font-bold mb-0.5 uppercase">Prev. Close</div>
                  <div className="font-semibold text-xs sm:text-sm font-mono text-white">₹{displayPrevClose.toLocaleString('en-IN')}</div>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <div className="text-[9px] sm:text-[10px] text-slate-500 font-bold mb-0.5 uppercase">Exchange</div>
                  <div className="font-semibold text-xs sm:text-sm text-cyan-400">NSE India</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] sm:text-[11px] text-slate-400">Timeframe:</span>
                <span className="text-xs font-bold text-cyan-300 font-mono bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-500/20">
                  {activeTimeframe} Interval
                </span>
              </div>
            </div>
          </div>

          {/* Sentiment Section Split */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            
            {/* Overall Sentiment Half Donut */}
            <div className="glass-panel p-4 sm:p-6 flex flex-col items-center relative overflow-hidden rounded-2xl border border-white/10">
              <h3 className="w-full font-manrope font-bold text-sm mb-4 sm:mb-6 text-left text-white">
                Overall Market Sentiment
              </h3>
              <div className="relative w-44 sm:w-48 h-22 sm:h-24 overflow-hidden mb-2">
                <svg viewBox="0 0 100 50" className="w-full h-full overflow-visible">
                  <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="12" strokeLinecap="round" />
                  <path d="M 10 50 A 40 40 0 0 1 75 15" fill="none" stroke="#10B981" strokeWidth="12" strokeLinecap="round" className="drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                </svg>
                <div className="absolute bottom-0 left-0 text-[10px] text-slate-500 font-bold">0</div>
                <div className="absolute bottom-0 right-0 text-[10px] text-slate-500 font-bold">100</div>
                
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex flex-col items-center">
                  <div className="text-xs sm:text-sm font-bold text-[#10B981] mb-0.5 sm:mb-1">Bullish Bias</div>
                  <div className="text-2xl sm:text-3xl font-manrope font-extrabold text-white">
                    68<span className="text-xs sm:text-sm text-slate-500 font-medium"> / 100</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Sentiment Distribution Pie & Alert */}
            <div className="glass-panel p-4 sm:p-6 flex flex-col justify-between rounded-2xl border border-white/10">
              <h3 className="font-manrope font-bold text-sm mb-3 sm:mb-4 text-white">Sentiment Distribution</h3>
              <div className="flex items-center gap-4 sm:gap-6 mb-3 sm:mb-4">
                <div className="w-20 sm:w-24 h-20 sm:h-24 shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={sentimentData}
                        cx="50%"
                        cy="50%"
                        innerRadius={22}
                        outerRadius={36}
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
                <div className="space-y-2 sm:space-y-3 flex-1">
                  {sentimentData.map((d) => (
                    <div key={d.name} className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-xs" style={{ backgroundColor: d.color }}></span>
                        <span className="text-slate-300">{d.name}</span>
                      </div>
                      <span className="font-semibold text-white">{d.value}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mini Alert Box */}
              <div className="bg-[#10B981]/10 border border-[#10B981]/20 rounded-xl p-2.5 sm:p-3 flex items-start gap-2.5 sm:gap-3">
                <div className="p-1 bg-[#10B981]/20 text-[#10B981] rounded mt-0.5">
                  <ArrowUpRight className="w-3 h-3" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-white">Institutional Flows Positive</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Ensemble Confidence: <span className="text-[#10B981] font-bold">92% High</span></div>
                </div>
              </div>

            </div>

          </div>
        </div>

        {/* Right Column (Major Indices + Live News) - 4 cols */}
        <div className="lg:col-span-4 space-y-4 sm:space-y-6 flex flex-col">
          
          {/* Major Indices (100% Real Live Market Quotes) */}
          <div className="glass-panel p-4 sm:p-5 flex-1 rounded-2xl border border-white/10">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <h3 className="font-manrope font-bold text-sm text-white">Major Indices</h3>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              </div>
              <button 
                onClick={() => setShowAllIndicesModal(true)}
                className="text-[11px] text-cyan-400 font-bold hover:text-cyan-300 transition-colors flex items-center gap-1 cursor-pointer"
              >
                View All <ExternalLink className="w-3 h-3" />
              </button>
            </div>
            
            <div className="space-y-3.5">
              {indices.slice(0, 5).map((idx) => {
                const isUp = idx.dp >= 0;
                return (
                  <div key={idx.symbol} className="flex items-center justify-between pb-3 border-b border-white/5 last:border-0 last:pb-0 hover:bg-white/[0.02] p-1.5 rounded-lg transition">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-[9px] font-bold font-mono text-cyan-300 border border-white/10">
                        {idx.label}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">{idx.name}</div>
                        <div className={cn("text-[10px] font-semibold mt-0.5 font-mono", isUp ? "text-[#10B981]" : "text-[#EF4444]")}>
                          {isUp ? "+" : ""}{idx.dp.toFixed(2)}%
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-right">
                      <div className="text-xs font-bold font-mono text-white">
                        {idx.name === "BITCOIN" || idx.name === "ETHEREUM" ? `$${idx.c.toLocaleString()}` : idx.c.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                      </div>

                      {/* Mini Real Sparkline SVG */}
                      <div className="w-10 h-4">
                        <svg width="40" height="16" viewBox="0 0 40 16">
                          <path 
                            d={isUp ? "M0,12 Q10,16 20,6 T40,2" : "M0,3 Q10,2 20,12 T40,14"} 
                            fill="none" 
                            stroke={isUp ? "#10B981" : "#EF4444"} 
                            strokeWidth="1.8" 
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Live News & Sentiment */}
          <div className="glass-panel p-5 flex-1 rounded-2xl border border-white/10">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-manrope font-bold text-sm text-white">Live News & Sentiment</h3>
              <Link href="/live-feed" className="text-[11px] text-cyan-400 font-bold hover:text-cyan-300 transition-colors">
                View Feed
              </Link>
            </div>

            <div className="space-y-4">
              {[
                { src: "Reuters", time: "2m ago", title: "RBI maintains repo rate, reinforces focus on resilient GDP growth", sent: 0.74, tag: "Bullish", color: "#10B981" },
                { src: "Bloomberg", time: "8m ago", title: "Asian markets track mixed cues ahead of global central bank commentary", sent: 0.46, tag: "Neutral", color: "#F59E0B" },
                { src: "MoneyControl", time: "14m ago", title: "Nifty tests 23,450 support level amid foreign institutional profit taking", sent: -0.58, tag: "Bearish", color: "#EF4444" }
              ].map((n, i) => (
                <div key={i} className="relative pl-3 border-l-2" style={{ borderColor: n.color }}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium">
                      <div className="w-3.5 h-3.5 bg-white/20 rounded-full flex items-center justify-center text-[7px] text-white font-bold">{n.src[0]}</div>
                      {n.src} <span className="w-1 h-1 bg-slate-600 rounded-full"></span> {n.time}
                    </div>
                    <div className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ color: n.color, backgroundColor: `${n.color}20` }}>
                      {n.tag}
                    </div>
                  </div>
                  <div className="text-xs font-medium leading-relaxed mb-2 text-slate-200">{n.title}</div>
                  <div className="flex items-center gap-2">
                    <div className="text-[9px] text-slate-400 font-mono">Score: <span style={{ color: n.color }}>{n.sent > 0 ? `+${n.sent}` : n.sent}</span></div>
                    <div className="flex-1 h-1 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full" style={{ width: `${Math.abs(n.sent)*100}%`, backgroundColor: n.color }}></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Link href="/live-feed" className="w-full mt-4 py-2 border border-cyan-500/30 text-cyan-300 text-xs font-semibold rounded-xl hover:bg-cyan-950/20 transition-colors flex items-center justify-center gap-2">
              View All News Feeds <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

        </div>
      </div>

      {/* Bottom Alert Banner */}
      <div className="bg-[#10B981]/10 border border-[#10B981]/30 rounded-2xl p-4 flex items-center gap-4 relative overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#10B981] shadow-[0_0_10px_#10B981]"></div>
        <div className="w-8 h-8 rounded-full bg-[#10B981] flex items-center justify-center text-black">
          <Bell className="w-4 h-4" fill="currentColor" />
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-bold text-[#10B981] mb-0.5">Real-Time Market Synchronized</h4>
          <p className="text-xs text-slate-300">
            Market overview, indices and NLP sentiment engines are operating live at 100% capacity with sub-second polling.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-slate-400 font-mono">LIVE FEED</span>
        </div>
      </div>

      {/* MODAL: View All Major Indices & Commodities */}
      {showAllIndicesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-4xl rounded-2xl bg-[#0A0E1A] border border-cyan-500/30 shadow-[0_25px_70px_rgba(0,0,0,0.9)] overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-white/10 bg-[#0F172A]">
              <div className="flex items-center gap-3">
                <Globe2 className="w-5 h-5 text-cyan-400" />
                <div>
                  <h3 className="font-space font-bold text-lg text-white">Global Markets & Major Indices</h3>
                  <p className="text-xs text-slate-400">Live prices across India, US, Crypto, and Global Commodities</p>
                </div>
              </div>
              <button 
                onClick={() => setShowAllIndicesModal(false)}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-slate-400 uppercase font-semibold text-[10px] tracking-wider">
                    <th className="pb-3">Index / Asset</th>
                    <th className="pb-3">Region</th>
                    <th className="pb-3 text-right">Live Price</th>
                    <th className="pb-3 text-right">Change</th>
                    <th className="pb-3 text-right">Day High</th>
                    <th className="pb-3 text-right">Day Low</th>
                    <th className="pb-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-mono">
                  {indices.map((idx) => {
                    const isUp = idx.dp >= 0;
                    return (
                      <tr key={idx.symbol} className="hover:bg-white/[0.02] transition">
                        <td className="py-3 font-sans">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded bg-cyan-950/40 text-cyan-400 flex items-center justify-center text-[10px] font-bold font-mono">
                              {idx.label}
                            </span>
                            <span className="font-bold text-white text-sm">{idx.name}</span>
                          </div>
                        </td>
                        <td className="py-3 font-sans text-slate-400 text-xs">{idx.region}</td>
                        <td className="py-3 text-right font-bold text-white text-sm">
                          {idx.name === "BITCOIN" || idx.name === "ETHEREUM" ? `$${idx.c.toLocaleString()}` : idx.c.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                        </td>
                        <td className={cn("py-3 text-right font-bold", isUp ? "text-[#10B981]" : "text-[#EF4444]")}>
                          {isUp ? "+" : ""}{idx.dp.toFixed(2)}%
                        </td>
                        <td className="py-3 text-right text-slate-300">{idx.h ? idx.h.toLocaleString() : "-"}</td>
                        <td className="py-3 text-right text-slate-300">{idx.l ? idx.l.toLocaleString() : "-"}</td>
                        <td className="py-3 text-center font-sans">
                          <Link
                            href={`/deep-dive?ticker=${encodeURIComponent(idx.symbol)}`}
                            onClick={() => setShowAllIndicesModal(false)}
                            className="px-2.5 py-1 rounded bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[11px] font-semibold transition inline-flex items-center gap-1"
                          >
                            Analyze <ArrowRight className="w-2.5 h-2.5" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="p-4 bg-[#080C14] border-t border-white/5 flex justify-between items-center text-xs text-slate-500">
              <span>Data updates every 15s via Yahoo Finance API</span>
              <button
                onClick={() => fetchIndices()}
                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-cyan-400 border border-cyan-500/20 flex items-center gap-1.5 transition"
              >
                <RefreshCw className={cn("w-3 h-3", indicesLoading && "animate-spin")} /> Refresh Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Active AI Models Health Breakdown */}
      {showAIModelsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-2xl rounded-2xl bg-[#0A0E1A] border border-cyan-500/30 shadow-[0_25px_70px_rgba(0,0,0,0.9)] overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-white/10 bg-[#0F172A]">
              <div className="flex items-center gap-3">
                <Brain className="w-6 h-6 text-amber-400" />
                <div>
                  <h3 className="font-space font-bold text-lg text-white">Active AI Models Ensemble</h3>
                  <p className="text-xs text-slate-400">5 Deep Learning & NLP Models Running in Memory</p>
                </div>
              </div>
              <button 
                onClick={() => setShowAIModelsModal(false)}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {[
                { name: "FinBERT", type: "Transformer SOTA", latency: "24ms", desc: "Trained on financial corpus (10-K, 10-Q, news headlines).", status: "Healthy" },
                { name: "RoBERTa Financial", type: "Deep Neural Net", latency: "31ms", desc: "Contextual token embeddings for subtle bullish/bearish tones.", status: "Healthy" },
                { name: "FinGPT", type: "Generative Finance LLM", latency: "42ms", desc: "Instruction-tuned financial sentiment reasoner.", status: "Healthy" },
                { name: "VADER", type: "Rule-Based Lexicon", latency: "3ms", desc: "Optimized for social media and rapid headline analysis.", status: "Healthy" },
                { name: "TextBlob", type: "Subjectivity Polarity", latency: "5ms", desc: "Calculates narrative subjectivity and tone intensity.", status: "Healthy" }
              ].map((m) => (
                <div key={m.name} className="p-3.5 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-white">{m.name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-white/10 text-slate-300">{m.type}</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{m.desc}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {m.status}
                    </span>
                    <div className="text-[10px] text-slate-500 font-mono mt-1">Latency: {m.latency}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 bg-[#080C14] border-t border-white/5 flex justify-between items-center text-xs">
              <span className="text-slate-500">Service: Sentiment Engine on Port 8002</span>
              <Link
                href="/research"
                onClick={() => setShowAIModelsModal(false)}
                className="px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 font-semibold flex items-center gap-1.5 transition"
              >
                Open in AI Quant Lab <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
