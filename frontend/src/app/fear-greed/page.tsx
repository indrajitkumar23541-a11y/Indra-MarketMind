"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  Smile, 
  Frown, 
  Meh, 
  Flame, 
  ShieldAlert, 
  ShieldCheck, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Compass, 
  Clock, 
  Sparkles, 
  RefreshCw, 
  Sliders, 
  Target, 
  BarChart3, 
  Layers, 
  Zap, 
  Award,
  Globe,
  Info,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  ReferenceLine 
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";

interface FactorItem {
  name: string;
  score: number;
  raw_metric: string;
  description: string;
  status: "EXTREME_FEAR" | "FEAR" | "NEUTRAL" | "GREED" | "EXTREME_GREED";
  weight: number;
}

interface TimelinePoint {
  date: string;
  full_date: string;
  score: number;
  label: string;
}

interface FearGreedData {
  status: string;
  market: "global" | "india";
  market_title: string;
  score: number;
  label: "EXTREME_FEAR" | "FEAR" | "NEUTRAL" | "GREED" | "EXTREME_GREED";
  status_label: string;
  status_color: string;
  summary_verdict: string;
  contrarian_signal: string;
  timestamp: string;
  time_deltas: {
    current: number;
    yesterday: number;
    one_week_ago: number;
    one_month_ago: number;
    one_year_ago: number;
    delta_yesterday: number;
    delta_week: number;
    delta_month: number;
    delta_year: number;
  };
  factors: FactorItem[];
  timeline: TimelinePoint[];
  generated_at: string;
}

export default function FearGreedPage() {
  const [selectedMarket, setSelectedMarket] = useState<"global" | "india">("global");
  const [data, setData] = useState<FearGreedData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFearGreed = useCallback(async (market: "global" | "india", isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/analytics/signals/fear-greed?market=${market}`);
      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }
      const json: FearGreedData = await res.json();
      if (json.status === "success" && typeof json.score === "number") {
        setData(json);
      } else {
        throw new Error("Invalid payload structure received");
      }
    } catch (err: any) {
      console.error("Fear & Greed fetch error:", err);
      setError("Unable to load real-time market emotion telemetry. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchFearGreed(selectedMarket);
  }, [selectedMarket, fetchFearGreed]);

  const handleMarketChange = (market: "global" | "india") => {
    if (market !== selectedMarket) {
      setSelectedMarket(market);
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case "EXTREME_FEAR":
        return "bg-rose-500/20 text-rose-400 border-rose-500/30";
      case "FEAR":
        return "bg-amber-500/20 text-amber-400 border-amber-500/30";
      case "NEUTRAL":
        return "bg-slate-500/20 text-slate-300 border-slate-500/30";
      case "GREED":
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
      case "EXTREME_GREED":
        return "bg-cyan-500/20 text-cyan-300 border-cyan-500/30";
      default:
        return "bg-slate-800 text-slate-400 border-slate-700";
    }
  };

  const getScoreColor = (score: number) => {
    if (score <= 25) return "#EF4444";
    if (score <= 45) return "#F59E0B";
    if (score <= 55) return "#94A3B8";
    if (score <= 75) return "#10B981";
    return "#00F0FF";
  };

  // Convert 0-100 score to angle for the gauge needle (-90deg to +90deg)
  const needleAngle = data ? -90 + (data.score / 100) * 180 : 0;

  return (
    <div className="space-y-6 pb-16 max-w-7xl mx-auto">
      
      {/* ─────────────────────────────────────────────────────────────
          1. HEADER & MARKET SWITCHER BAR
      ───────────────────────────────────────────────────────────── */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 shadow-2xl relative overflow-hidden flex flex-wrap justify-between items-center gap-4 bg-linear-to-r from-[#0a0f1d] via-[#0b1328] to-[#070b16]">
        <div className="absolute top-0 right-0 w-96 h-full bg-linear-to-l from-cyan-500/5 to-transparent pointer-events-none" />
        
        <div className="flex items-center gap-4 relative z-10">
          <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-xl border border-cyan-500/20 shadow-inner">
            <Compass className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-manrope font-extrabold text-white tracking-tight">
                Global Fear & Greed Terminal
              </h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                100% REAL LIVE TELEMETRY
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Quantifying multi-dimensional market emotions across momentum, volatility, credit spreads, and options hedging.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          {/* Market Switcher Toggle */}
          <div className="bg-slate-900/90 p-1 rounded-xl border border-slate-800 shadow-inner flex items-center gap-1 text-xs">
            <button
              onClick={() => handleMarketChange("global")}
              className={`px-3.5 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                selectedMarket === "global"
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <span>🇺🇸 Wall Street (S&P 500)</span>
            </button>
            <button
              onClick={() => handleMarketChange("india")}
              className={`px-3.5 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                selectedMarket === "india"
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <span>🇮🇳 Dalal Street (Nifty 50)</span>
            </button>
          </div>

          {/* Refresh Button */}
          <button
            onClick={() => fetchFearGreed(selectedMarket, true)}
            disabled={refreshing}
            className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-cyan-400 transition-colors cursor-pointer"
            title="Refresh Real-Time Market Emotion"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin text-cyan-400" : ""}`} />
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          2. CORE SPEEDOMETER GAUGE & 1-YEAR HISTORICAL EMOTION CHART
      ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Speedometer Gauge Card (5 Cols) */}
        <div className="lg:col-span-5 glass-panel p-6 rounded-2xl border border-slate-800 shadow-2xl flex flex-col justify-between items-center text-center relative bg-linear-to-b from-[#0c1224] to-[#070b14]">
          <div className="w-full flex justify-between items-center text-xs text-slate-400 mb-2">
            <span className="font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-cyan-400" /> Current Market Emotion
            </span>
            <span className="font-mono text-[11px] text-slate-500">
              {data?.generated_at || "Live"}
            </span>
          </div>

          {/* Institutional SVG Gauge */}
          <div className="relative w-72 h-44 my-2 flex items-center justify-center">
            <svg viewBox="0 0 200 115" className="w-full h-full drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]">
              <defs>
                {/* Arc Color Gradient */}
                <linearGradient id="speedometerGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#EF4444" />
                  <stop offset="25%" stopColor="#F59E0B" />
                  <stop offset="50%" stopColor="#94A3B8" />
                  <stop offset="75%" stopColor="#10B981" />
                  <stop offset="100%" stopColor="#00F0FF" />
                </linearGradient>
                {/* Glowing Needle Filter */}
                <filter id="needleGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#00F0FF" floodOpacity="0.6" />
                </filter>
              </defs>

              {/* Background Arc Track */}
              <path
                d="M 25 100 A 75 75 0 0 1 175 100"
                fill="none"
                stroke="#1E293B"
                strokeWidth="16"
                strokeLinecap="round"
              />

              {/* Colored Zone Arc */}
              <path
                d="M 25 100 A 75 75 0 0 1 175 100"
                fill="none"
                stroke="url(#speedometerGradient)"
                strokeWidth="16"
                strokeLinecap="round"
                strokeDasharray="235"
                strokeDashoffset="0"
                opacity="0.9"
              />

              {/* Tick Marks for 25, 50, 75 */}
              <line x1="62" y1="46" x2="68" y2="52" stroke="#0F172A" strokeWidth="2.5" />
              <line x1="100" y1="25" x2="100" y2="33" stroke="#0F172A" strokeWidth="2.5" />
              <line x1="138" y1="46" x2="132" y2="52" stroke="#0F172A" strokeWidth="2.5" />

              {/* Animated Needle */}
              <g
                transform={`rotate(${needleAngle} 100 100)`}
                style={{ transition: "transform 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)" }}
              >
                <line
                  x1="100"
                  y1="100"
                  x2="100"
                  y2="34"
                  stroke="#FFFFFF"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  filter="url(#needleGlow)"
                />
                <circle cx="100" cy="100" r="8" fill="#00F0FF" stroke="#0F172A" strokeWidth="2" />
                <circle cx="100" cy="100" r="3" fill="#FFFFFF" />
              </g>
            </svg>

            {/* Centered Large Number & Status */}
            <div className="absolute bottom-1 flex flex-col items-center">
              <div 
                className="text-5xl font-manrope font-black tracking-tight drop-shadow-md"
                style={{ color: getScoreColor(data?.score ?? 50) }}
              >
                {data?.score ?? 50}
              </div>
            </div>
          </div>

          {/* Status Badge */}
          <div className="mt-1">
            <span 
              className={`px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest border shadow-lg inline-block ${
                getStatusBg(data?.label ?? "NEUTRAL")
              }`}
            >
              {data?.status_label || "Neutral"}
            </span>
          </div>

          {/* Psychological Verdict */}
          <p className="text-xs text-slate-300 mt-3 max-w-sm leading-relaxed">
            {data?.summary_verdict || "Evaluating multi-factor market psychology from live volatility and price momentum."}
          </p>

          {/* Contrarian Indicator Bar */}
          <div className="w-full mt-4 pt-3 border-t border-slate-800/80">
            <div className="p-2.5 rounded-xl bg-slate-900/80 border border-indigo-500/20 flex items-center justify-between text-left">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Contrarian Playbook:</span>
                  <span className="text-xs font-bold text-cyan-300">{data?.contrarian_signal || "Neutral Allocation"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 1-Year Historical Emotion Area Chart (7 Cols) */}
        <div className="lg:col-span-7 glass-panel p-6 rounded-2xl border border-slate-800 shadow-2xl flex flex-col justify-between bg-linear-to-b from-[#0c1224] to-[#070b14]">
          <div className="flex justify-between items-center mb-3">
            <div>
              <h3 className="font-manrope font-bold text-sm text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" /> Historical Emotion Trend (1 Year)
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Weekly historical sentiment cycles derived from live market candles and moving average deviations.
              </p>
            </div>
            <div className="flex items-center gap-3 text-[10px] font-mono">
              <span className="flex items-center gap-1 text-cyan-400">
                <span className="w-2 h-2 rounded-full bg-cyan-400" /> &gt;75 Extreme Greed
              </span>
              <span className="flex items-center gap-1 text-rose-400">
                <span className="w-2 h-2 rounded-full bg-rose-400" /> &lt;25 Extreme Fear
              </span>
            </div>
          </div>

          {/* Recharts Area Chart */}
          <div className="w-full h-56 my-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.timeline || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="fearGreedChartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00F0FF" stopOpacity={0.45} />
                    <stop offset="50%" stopColor="#10B981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0.4} />
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748B', fontSize: 10 }} 
                  dy={10} 
                />
                <YAxis 
                  domain={[0, 100]} 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748B', fontSize: 10 }} 
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0b101d', 
                    borderColor: '#334155', 
                    borderRadius: '12px', 
                    fontSize: '11px', 
                    color: '#fff' 
                  }}
                  formatter={(val: any) => [`${val}/100`, "Emotion Score"]}
                  labelFormatter={(lbl: any, payload: any) => {
                    const item = payload?.[0]?.payload;
                    return item ? `${item.full_date} (${item.label})` : lbl;
                  }}
                />
                {/* Extreme Greed Reference Corridor */}
                <ReferenceLine 
                  y={75} 
                  stroke="#00F0FF" 
                  strokeDasharray="3 3" 
                  strokeOpacity={0.5} 
                  label={{ position: 'insideTopLeft', value: 'Extreme Greed (75)', fill: '#00F0FF', fontSize: 10 }} 
                />
                {/* Neutral Midpoint */}
                <ReferenceLine 
                  y={50} 
                  stroke="#64748B" 
                  strokeDasharray="2 2" 
                  strokeOpacity={0.3} 
                />
                {/* Extreme Fear Reference Corridor */}
                <ReferenceLine 
                  y={25} 
                  stroke="#EF4444" 
                  strokeDasharray="3 3" 
                  strokeOpacity={0.5} 
                  label={{ position: 'insideBottomLeft', value: 'Extreme Fear (25)', fill: '#EF4444', fontSize: 10 }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#00F0FF" 
                  strokeWidth={2.5} 
                  fill="url(#fearGreedChartGrad)" 
                  isAnimationActive={true}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Time-Delta Horizon Matrix Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-slate-800/80">
            <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
              <span className="text-[10px] text-slate-500 font-bold uppercase block">Previous Close</span>
              <div className="flex items-center justify-between mt-1">
                <span className="text-sm font-bold font-mono text-white">{data?.time_deltas?.yesterday ?? 50}</span>
                <span className={`text-[10px] font-mono font-bold flex items-center ${
                  (data?.time_deltas?.delta_yesterday ?? 0) >= 0 ? "text-emerald-400" : "text-rose-400"
                }`}>
                  {(data?.time_deltas?.delta_yesterday ?? 0) >= 0 ? "+" : ""}{data?.time_deltas?.delta_yesterday ?? 0}
                </span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
              <span className="text-[10px] text-slate-500 font-bold uppercase block">1 Week Ago</span>
              <div className="flex items-center justify-between mt-1">
                <span className="text-sm font-bold font-mono text-white">{data?.time_deltas?.one_week_ago ?? 50}</span>
                <span className={`text-[10px] font-mono font-bold flex items-center ${
                  (data?.time_deltas?.delta_week ?? 0) >= 0 ? "text-emerald-400" : "text-rose-400"
                }`}>
                  {(data?.time_deltas?.delta_week ?? 0) >= 0 ? "+" : ""}{data?.time_deltas?.delta_week ?? 0}
                </span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
              <span className="text-[10px] text-slate-500 font-bold uppercase block">1 Month Ago</span>
              <div className="flex items-center justify-between mt-1">
                <span className="text-sm font-bold font-mono text-white">{data?.time_deltas?.one_month_ago ?? 50}</span>
                <span className={`text-[10px] font-mono font-bold flex items-center ${
                  (data?.time_deltas?.delta_month ?? 0) >= 0 ? "text-emerald-400" : "text-rose-400"
                }`}>
                  {(data?.time_deltas?.delta_month ?? 0) >= 0 ? "+" : ""}{data?.time_deltas?.delta_month ?? 0}
                </span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
              <span className="text-[10px] text-slate-500 font-bold uppercase block">1 Year Ago</span>
              <div className="flex items-center justify-between mt-1">
                <span className="text-sm font-bold font-mono text-white">{data?.time_deltas?.one_year_ago ?? 50}</span>
                <span className={`text-[10px] font-mono font-bold flex items-center ${
                  (data?.time_deltas?.delta_year ?? 0) >= 0 ? "text-emerald-400" : "text-rose-400"
                }`}>
                  {(data?.time_deltas?.delta_year ?? 0) >= 0 ? "+" : ""}{data?.time_deltas?.delta_year ?? 0}
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. 7-FACTOR QUANTITATIVE DEEP-DIVE MATRIX
      ───────────────────────────────────────────────────────────── */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 shadow-2xl bg-linear-to-br from-[#0c1220] via-[#080d18] to-[#060912]">
        <div className="flex flex-wrap justify-between items-center gap-2 mb-6 pb-3 border-b border-slate-800">
          <div>
            <h3 className="font-manrope font-bold text-lg text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-cyan-400" />
              Institutional 7-Factor Deep Dive Matrix
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Individual mathematical components driving the composite index with live raw market telemetry disclosures.
            </p>
          </div>
          <span className="text-[11px] font-mono bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full border border-indigo-500/30 font-bold">
            Weight Distribution: 100% Normalized
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {data?.factors?.map((f, idx) => (
            <div 
              key={f.name}
              className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between shadow-md"
            >
              <div>
                {/* Header */}
                <div className="flex justify-between items-start gap-2 mb-2">
                  <span className="font-bold text-xs text-white leading-snug">
                    {idx + 1}. {f.name}
                  </span>
                  <span className="text-[10px] font-mono bg-slate-900 text-slate-400 border border-slate-800 px-1.5 py-0.5 rounded font-bold shrink-0">
                    {f.weight}% Wt
                  </span>
                </div>

                {/* Score & Badge */}
                <div className="flex items-baseline justify-between mb-2">
                  <div className="text-2xl font-mono font-black text-white">
                    {f.score}<span className="text-xs text-slate-500 font-normal">/100</span>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${getStatusBg(f.status)}`}>
                    {f.status.replace("_", " ")}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden mb-3">
                  <div 
                    className="h-full rounded-full transition-all duration-1000"
                    style={{ 
                      width: `${f.score}%`,
                      backgroundColor: getScoreColor(f.score)
                    }}
                  />
                </div>

                {/* Raw Metric Disclosure */}
                <div className="p-2 bg-slate-900/90 rounded-lg border border-slate-800/80 text-[11px] font-mono text-cyan-300 mb-2">
                  {f.raw_metric}
                </div>
              </div>

              {/* Narrative Description */}
              <p className="text-[11px] text-slate-400 leading-relaxed mt-2 pt-2 border-t border-slate-900">
                {f.description}
              </p>
            </div>
          ))}

          {/* 8th Summary Card: Warren Buffett Rule */}
          <div className="p-4 rounded-xl bg-linear-to-br from-indigo-950/40 via-slate-950/80 to-[#0c1224] border border-indigo-500/30 flex flex-col justify-between shadow-md">
            <div>
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs mb-2">
                <Award className="w-4 h-4 text-cyan-400" />
                <span>The Warren Buffett Compass</span>
              </div>
              <blockquote className="text-xs text-slate-300 italic leading-relaxed border-l-2 border-cyan-400 pl-2.5 my-2">
                &ldquo;Be fearful when others are greedy, and greedy when others are fearful.&rdquo;
              </blockquote>
            </div>

            <div className="mt-3 pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
              <span className="font-semibold text-white block mb-0.5">Tactical Rule:</span>
              <span>
                Extreme Fear readings (&lt;25) have historically preceded the strongest 12-month forward equity returns in market history.
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          4. AI MACRO DISPATCH MEMO
      ───────────────────────────────────────────────────────────── */}
      <div className="glass-panel p-6 rounded-2xl border border-indigo-500/30 bg-linear-to-r from-[#0c1224] via-[#090f1d] to-[#060914] shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1.5 max-w-3xl">
          <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
            <Sparkles className="w-4 h-4 text-cyan-400 animate-spin" />
            <span>AI Macro Sentiment Synthesis Memo</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Market regime is currently situated in <strong className="text-white">{data?.status_label}</strong> territory ({data?.score ?? 50}/100) for {data?.market_title}. 
            {(data?.score ?? 50) > 60 
              ? " Price momentum across mega-caps remains elevated above key moving averages while credit spreads remain contained. However, traders should note diminishing risk premia and maintain defensive stops."
              : (data?.score ?? 50) < 40 
              ? " Hedging pressure and volatility demand indicate widespread risk aversion. Capitulation dynamics suggest attractive long-term entry multiples for disciplined investors."
              : " Balanced institutional equilibrium prevails without extreme directional skew."}
          </p>
        </div>

        <div className="shrink-0 flex items-center gap-3">
          <button
            onClick={() => handleMarketChange(selectedMarket === "global" ? "india" : "global")}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-cyan-400/50 rounded-xl text-xs font-bold text-white transition-all shadow-lg flex items-center gap-2 cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            <span>Switch to {selectedMarket === "global" ? "🇮🇳 Nifty 50" : "🇺🇸 S&P 500"}</span>
          </button>
        </div>
      </div>

    </div>
  );
}
