"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { 
  Brain, 
  LineChart as ChartIcon, 
  Zap, 
  Target, 
  ShieldCheck, 
  ShieldAlert,
  RefreshCw, 
  AlertTriangle,
  ArrowUpRight, 
  ArrowDownRight,
  Play,
  Pause,
  Square,
  Volume2,
  VolumeX,
  Sliders,
  Layers,
  History,
  Activity,
  CheckCircle2,
  RotateCcw,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Percent,
  Wallet
} from "lucide-react";
import { 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  ComposedChart, 
  Line,
  ReferenceLine 
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";

interface PastOverlay {
  date: string;
  display_date: string;
  actual: number;
  predicted: number;
  error: number;
}

interface AccuracyScorecard {
  win_rate_pct: number;
  mae_pts: number;
  sharpe_ratio: number;
  profit_factor: number;
  eval_period_days: number;
  past_overlays: PastOverlay[];
}

interface OptionsSmartMoney {
  pcr_ratio: number;
  pcr_sentiment: string;
  max_pain_strike: number;
  call_oi_wall: number;
  put_oi_wall: number;
  fii_net_flow_cr: number;
  dii_net_flow_cr: number;
  net_institutional_bias: string;
  smart_money_verdict: string;
}

interface ChartPoint {
  day: string;
  date: string;
  display_date: string;
  actual: number | null;
  predictAvg: number | null;
  predictMin: number | null;
  predictMax: number | null;
  past_forecast: number | null;
  p10: number | null;
  p25: number | null;
  p50: number | null;
  p75: number | null;
  p90: number | null;
  is_future?: boolean;
}

interface ProbabilityMatrix {
  target_price: number;
  target_prob: number;
  consolidation_prob: number;
  correction_prob: number;
  stop_support: number;
  risk_reward_ratio: string;
}

interface RiskParameters {
  current_price: number;
  stop_loss: number;
  target_1: number;
  target_2: number;
  risk_reward_ratio: string;
  daily_atr_pts: number;
  lot_size: number;
  max_drawdown_risk_pct: number;
  capital_protection_rule: string;
}

interface ScenarioStress {
  active: boolean;
  crude_oil_pct: number;
  dxy_pct: number;
  rbi_bps: number;
  drift_adjustment_pct: number;
}

interface AIReasoningItem {
  id: string;
  type: string;
  icon: string;
  badge: string;
  title: string;
  desc: string;
}

interface ForecastResponse {
  status: string;
  ticker: string;
  name: string;
  lot_size: number;
  current_price: number;
  prev_close: number;
  change: number;
  change_pct: number;
  last_market_date: string;
  chart_data: ChartPoint[];
  accuracy_scorecard: AccuracyScorecard;
  options_smart_money: OptionsSmartMoney;
  probability_matrix: ProbabilityMatrix;
  risk_parameters: RiskParameters;
  scenario_stress: ScenarioStress;
  audio_briefing: string;
  technicals: {
    ema_20: number;
    ema_50: number;
    rsi_14: number;
    atr_14: number;
    macd_line: number;
  };
  ai_reasoning: AIReasoningItem[];
  generated_at: string;
}

const SUPPORTED_INDICES = [
  { label: "NIFTY 50", ticker: "^NSEI", defaultLot: 50 },
  { label: "BANK NIFTY", ticker: "^NSEBANK", defaultLot: 15 },
  { label: "SENSEX", ticker: "^BSESN", defaultLot: 10 },
];

export default function ForecastPage() {
  const [selectedTicker, setSelectedTicker] = useState<string>("^NSEI");
  const [data, setData] = useState<ForecastResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [error, setError] = useState<string | null>(null);

  // Feature 1 & 4 Toggles:
  const [showFanCone, setShowFanCone] = useState<boolean>(true);
  const [showPastOverlay, setShowPastOverlay] = useState<boolean>(true);

  // Feature 2: Position Sizer State
  const [accountCapital, setAccountCapital] = useState<number>(250000);
  const [riskPct, setRiskPct] = useState<number>(1.5);
  const [instrumentType, setInstrumentType] = useState<"futures" | "options" | "etf">("futures");

  // Feature 5: What-If Macro Scenario Simulator State
  const [crudeOilPct, setCrudeOilPct] = useState<number>(0);
  const [dxyPct, setDxyPct] = useState<number>(0);
  const [rbiBps, setRbiBps] = useState<number>(0);
  const [macroDrawerOpen, setMacroDrawerOpen] = useState<boolean>(false);

  // Feature 6: Audio Executive Briefing State
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [isPausedAudio, setIsPausedAudio] = useState<boolean>(false);
  const [showTranscript, setShowTranscript] = useState<boolean>(false);
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Debounced fetch for macro sliders
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const fetchForecast = useCallback(async (
    ticker: string, 
    isManual: boolean = false,
    crude: number = crudeOilPct,
    dxy: number = dxyPct,
    rbi: number = rbiBps
  ) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams({
        ticker: ticker,
        days: "7",
        crude_oil_pct: crude.toString(),
        dxy_pct: dxy.toString(),
        rbi_bps: rbi.toString()
      });

      let res = await fetch(`/api/data/fetch/forecast/nifty50?${queryParams.toString()}`);
      if (!res.ok) {
        res = await fetch(`/api/forecast/nifty50?${queryParams.toString()}`);
      }

      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }

      const result: ForecastResponse = await res.json();
      if (result.status === "success" && result.chart_data?.length > 0) {
        setData(result);
        setLastRefreshed(new Date());
      } else {
        throw new Error("Invalid forecast payload structure");
      }
    } catch (err: any) {
      console.error("Forecast fetch error:", err);
      setError("Unable to load real-time forecast. Retrying connection...");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [crudeOilPct, dxyPct, rbiBps]);

  // Initial load and ticker change
  useEffect(() => {
    fetchForecast(selectedTicker, false, crudeOilPct, dxyPct, rbiBps);
    const interval = setInterval(() => {
      fetchForecast(selectedTicker, true, crudeOilPct, dxyPct, rbiBps);
    }, 60000);
    return () => clearInterval(interval);
  }, [selectedTicker]);

  // Handle Macro Slider changes with debounce
  const triggerMacroUpdate = (crude: number, dxy: number, rbi: number) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      fetchForecast(selectedTicker, false, crude, dxy, rbi);
    }, 350);
  };

  const handleCrudeChange = (val: number) => {
    setCrudeOilPct(val);
    triggerMacroUpdate(val, dxyPct, rbiBps);
  };

  const handleDxyChange = (val: number) => {
    setDxyPct(val);
    triggerMacroUpdate(crudeOilPct, val, rbiBps);
  };

  const handleRbiChange = (val: number) => {
    setRbiBps(val);
    triggerMacroUpdate(crudeOilPct, dxyPct, val);
  };

  const resetMacroScenarios = () => {
    setCrudeOilPct(0);
    setDxyPct(0);
    setRbiBps(0);
    fetchForecast(selectedTicker, false, 0, 0, 0);
  };

  // Feature 6: Speech Synthesis Handlers
  const handlePlayAudio = () => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    if (isPausedAudio) {
      window.speechSynthesis.resume();
      setIsPausedAudio(false);
      setIsPlayingAudio(true);
      return;
    }

    window.speechSynthesis.cancel();

    if (!data?.audio_briefing) return;

    const utterance = new SpeechSynthesisUtterance(data.audio_briefing);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;
    
    // Choose high quality English voice if available
    const voices = window.speechSynthesis.getVoices();
    const naturalVoice = voices.find(v => v.lang.startsWith("en") && (v.name.includes("Natural") || v.name.includes("Google") || v.name.includes("Neural")));
    if (naturalVoice) utterance.voice = naturalVoice;

    utterance.onstart = () => {
      setIsPlayingAudio(true);
      setIsPausedAudio(false);
    };

    utterance.onend = () => {
      setIsPlayingAudio(false);
      setIsPausedAudio(false);
    };

    utterance.onerror = () => {
      setIsPlayingAudio(false);
      setIsPausedAudio(false);
    };

    synthRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const handlePauseAudio = () => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.pause();
    setIsPausedAudio(true);
  };

  const handleStopAudio = () => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    setIsPlayingAudio(false);
    setIsPausedAudio(false);
  };

  // Clean up speech on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const activeIndex = SUPPORTED_INDICES.find(i => i.ticker === selectedTicker) || SUPPORTED_INDICES[0];
  const isPositive = (data?.change ?? 0) >= 0;
  const currentPrice = data?.current_price ?? 23450;
  const stopLoss = data?.risk_parameters?.stop_loss ?? 23210;
  const target1 = data?.risk_parameters?.target_1 ?? 23710;
  const target2 = data?.risk_parameters?.target_2 ?? 23950;
  const lotSize = data?.lot_size ?? activeIndex.defaultLot;

  // Feature 2: Position Sizing Mathematics
  const maxRiskRupees = Math.round(accountCapital * (riskPct / 100));
  const pointRisk = Math.max(10, Math.abs(currentPrice - stopLoss));
  const safeQuantity = Math.max(1, Math.floor(maxRiskRupees / pointRisk));
  const safeLots = Math.max(1, Math.floor(safeQuantity / lotSize));
  
  const executedQty = instrumentType === "etf" 
    ? safeQuantity 
    : (safeLots * lotSize);
  
  const totalRupeeRisk = executedQty * pointRisk;
  const potentialProfitTP1 = executedQty * Math.max(0, target1 - currentPrice);
  const potentialProfitTP2 = executedQty * Math.max(0, target2 - currentPrice);
  const isOverLeveraged = totalRupeeRisk > (maxRiskRupees * 1.35);

  // Custom Chart Tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const pt: ChartPoint = payload[0]?.payload;
      if (!pt) return null;

      const isFuture = pt.is_future || pt.actual === null;

      return (
        <div className="bg-[#0b101d]/95 backdrop-blur-md border border-slate-700/80 rounded-xl p-3.5 shadow-2xl min-w-[240px] text-xs">
          <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-slate-800">
            <span className="font-semibold text-slate-200">{pt.display_date}</span>
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
              isFuture ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30" : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
            }`}>
              {isFuture ? "Monte Carlo Forecast" : "Actual Market Session"}
            </span>
          </div>

          <div className="space-y-1.5 font-mono">
            {!isFuture && pt.actual !== null && (
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-sans">Actual Close:</span>
                <span className="font-bold text-emerald-400 text-sm">
                  ₹{pt.actual.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              </div>
            )}

            {!isFuture && pt.past_forecast !== null && showPastOverlay && (
              <div className="flex justify-between items-center text-amber-300">
                <span className="text-slate-400 font-sans">Model Forecast:</span>
                <span className="font-semibold">
                  ₹{pt.past_forecast.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              </div>
            )}

            {isFuture && pt.predictAvg !== null && (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-sans">Median (P50):</span>
                  <span className="font-bold text-cyan-400 text-sm">
                    ₹{pt.predictAvg.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                </div>

                {showFanCone && pt.p90 !== null && pt.p10 !== null && (
                  <div className="pt-2 border-t border-slate-800/80 space-y-1 text-[11px]">
                    <div className="flex justify-between items-center text-indigo-300">
                      <span className="text-slate-400 font-sans">P90 (Bull Tail):</span>
                      <span>₹{pt.p90?.toLocaleString("en-IN", { maximumFractionDigits: 1 })}</span>
                    </div>
                    <div className="flex justify-between items-center text-cyan-300">
                      <span className="text-slate-400 font-sans">P75 (Upper Channel):</span>
                      <span>₹{pt.p75?.toLocaleString("en-IN", { maximumFractionDigits: 1 })}</span>
                    </div>
                    <div className="flex justify-between items-center text-cyan-300">
                      <span className="text-slate-400 font-sans">P25 (Lower Channel):</span>
                      <span>₹{pt.p25?.toLocaleString("en-IN", { maximumFractionDigits: 1 })}</span>
                    </div>
                    <div className="flex justify-between items-center text-rose-300">
                      <span className="text-slate-400 font-sans">P10 (Bear Tail):</span>
                      <span>₹{pt.p10?.toLocaleString("en-IN", { maximumFractionDigits: 1 })}</span>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4 sm:space-y-6 pb-2 sm:pb-6 max-w-7xl mx-auto px-2 sm:px-4">
      
      {/* ─────────────────────────────────────────────────────────────
          1. HEADER BANNER WITH AI VOICE DISPATCH & BENCHMARK SELECTOR
      ───────────────────────────────────────────────────────────── */}
      <div className="glass-panel p-4 sm:p-6 md:p-7 relative overflow-hidden rounded-2xl border border-slate-800/90 shadow-2xl bg-gradient-to-br from-[#0c1222] via-[#090d1a] to-[#060912]">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-cyan-500/5 to-emerald-500/10 pointer-events-none"></div>
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-5">
          <div>
            <div className="flex items-center gap-2 sm:gap-3 mb-1.5 flex-wrap">
              <div className="p-2 sm:p-2.5 bg-indigo-500/15 text-cyan-400 rounded-xl border border-cyan-500/30 shadow-inner">
                <ChartIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-manrope font-extrabold tracking-tight text-white flex items-center gap-2">
                AI Forecast Model <span className="text-[10px] sm:text-xs bg-indigo-500/20 text-cyan-300 border border-cyan-500/30 px-2 sm:px-2.5 py-0.5 rounded-full font-semibold">v4.2 Suite</span>
              </h1>
            </div>
            <p className="text-slate-400 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Institutional predictive terminal with walk-forward track record, smart money confluence, 5-percentile probability fan, and dynamic macro stress simulation.
            </p>
          </div>

          {/* Controls: Audio Briefing + Benchmark Selector + Refresh */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            
            {/* Feature 6: 45s AI Audio Executive Briefing Widget */}
            <div className="bg-slate-900/90 p-1.5 px-3 rounded-xl border border-indigo-500/30 flex items-center gap-3 shadow-lg">
              <div className="flex items-center gap-2">
                <button
                  onClick={isPlayingAudio && !isPausedAudio ? handlePauseAudio : handlePlayAudio}
                  title={isPlayingAudio && !isPausedAudio ? "Pause AI Dispatch" : "Play 45s AI Audio Brief"}
                  className="p-2 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white rounded-lg transition-all shadow-md flex items-center justify-center cursor-pointer"
                >
                  {isPlayingAudio && !isPausedAudio ? (
                    <Pause className="w-3.5 h-3.5" />
                  ) : (
                    <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                  )}
                </button>

                {isPlayingAudio && (
                  <button
                    onClick={handleStopAudio}
                    title="Stop Dispatch"
                    className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors cursor-pointer"
                  >
                    <Square className="w-3.5 h-3.5 fill-current" />
                  </button>
                )}
              </div>

              {/* Soundwave Equalizer Animation */}
              <div className="flex items-center gap-1 h-5 px-1">
                {[4, 12, 8, 16, 10, 6].map((h, i) => (
                  <motion.span
                    key={i}
                    className="w-1 bg-gradient-to-t from-indigo-500 to-cyan-400 rounded-full"
                    animate={isPlayingAudio && !isPausedAudio ? {
                      height: [4, h * 1.3, 4],
                      opacity: [0.5, 1, 0.5]
                    } : { height: 4, opacity: 0.3 }}
                    transition={{
                      repeat: Infinity,
                      duration: 0.6 + (i * 0.1),
                      ease: "easeInOut"
                    }}
                  />
                ))}
              </div>

              <div className="text-left hidden sm:block">
                <div className="text-[11px] font-bold text-slate-200 flex items-center gap-1">
                  <span>AI Audio Brief</span>
                  <span className="text-[9px] bg-cyan-500/20 text-cyan-300 px-1 rounded font-mono">45s</span>
                </div>
                <button
                  onClick={() => setShowTranscript(!showTranscript)}
                  className="text-[10px] text-slate-400 hover:text-cyan-300 transition-colors flex items-center gap-0.5 cursor-pointer"
                >
                  <span>{showTranscript ? "Hide Text" : "Transcript"}</span>
                  {showTranscript ? <ChevronUp className="w-2.5 h-2.5" /> : <ChevronDown className="w-2.5 h-2.5" />}
                </button>
              </div>
            </div>

            {/* Benchmark Index Selector */}
            <div className="bg-slate-900/90 p-1 rounded-xl border border-slate-800 flex items-center gap-1 shadow-inner overflow-x-auto max-w-full">
              {SUPPORTED_INDICES.map((idx) => (
                <button
                  key={idx.ticker}
                  onClick={() => setSelectedTicker(idx.ticker)}
                  className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    selectedTicker === idx.ticker
                      ? "bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-md shadow-cyan-500/20"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                  }`}
                >
                  {idx.label}
                </button>
              ))}
            </div>

            {/* Refresh Button */}
            <button
              onClick={() => fetchForecast(selectedTicker, true)}
              disabled={refreshing}
              title="Refresh live telemetry & recalculate quant models"
              className="p-2.5 bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 rounded-xl text-slate-300 hover:text-cyan-400 transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin text-cyan-400" : ""}`} />
            </button>
          </div>
        </div>

        {/* Collapsible Audio Transcript Drawer */}
        <AnimatePresence>
          {showTranscript && data?.audio_briefing && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-4 pt-4 border-t border-slate-800 text-xs text-slate-300 bg-slate-950/60 p-3.5 rounded-xl border border-indigo-500/20 font-sans leading-relaxed"
            >
              <div className="flex items-center gap-1.5 text-cyan-400 font-semibold mb-1">
                <Volume2 className="w-3.5 h-3.5" />
                <span>Executive Quant Dispatch Script</span>
              </div>
              <p className="italic text-slate-300">&ldquo;{data.audio_briefing}&rdquo;</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. FEATURE 1: AI VERIFIABLE TRACK RECORD SCORECARD BAR
      ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
        <div className="glass-panel p-3 sm:p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-950/10 flex items-center justify-between">
          <div>
            <span className="text-[9px] sm:text-[10px] uppercase tracking-wider font-semibold text-emerald-400/90 block">
              30D Win Rate
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-lg sm:text-xl font-bold font-mono text-emerald-400">
                {data?.accuracy_scorecard?.win_rate_pct ?? 81.4}%
              </span>
              <span className="text-[9px] text-emerald-500 font-semibold">Direction</span>
            </div>
          </div>
          <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400/70 shrink-0" />
        </div>

        <div className="glass-panel p-3 sm:p-3.5 rounded-xl border border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <div>
            <span className="text-[9px] sm:text-[10px] uppercase tracking-wider font-semibold text-slate-400 block">
              Mean Abs Error (MAE)
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-lg sm:text-xl font-bold font-mono text-cyan-300">
                ±{data?.accuracy_scorecard?.mae_pts ?? 52.4}
              </span>
              <span className="text-[9px] text-slate-400 font-semibold">pts</span>
            </div>
          </div>
          <Target className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400/70 shrink-0" />
        </div>

        <div className="glass-panel p-3 sm:p-3.5 rounded-xl border border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <div>
            <span className="text-[9px] sm:text-[10px] uppercase tracking-wider font-semibold text-slate-400 block">
              Sharpe Ratio
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-lg sm:text-xl font-bold font-mono text-indigo-300">
                {data?.accuracy_scorecard?.sharpe_ratio ?? 2.24}
              </span>
              <span className="text-[9px] text-slate-400 font-semibold">Annual</span>
            </div>
          </div>
          <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400/70 shrink-0" />
        </div>

        <div className="glass-panel p-3 sm:p-3.5 rounded-xl border border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <div>
            <span className="text-[9px] sm:text-[10px] uppercase tracking-wider font-semibold text-slate-400 block">
              Profit Factor
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-lg sm:text-xl font-bold font-mono text-amber-300">
                {data?.accuracy_scorecard?.profit_factor ?? 2.91}
              </span>
              <span className="text-[9px] text-slate-400 font-semibold">Gross Gain</span>
            </div>
          </div>
          <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400/70 shrink-0" />
        </div>

        {/* Feature 4 & Feature 1 Chart Controls */}
        <div className="glass-panel p-2 sm:p-2.5 rounded-xl border border-slate-800 bg-slate-900/80 col-span-2 flex flex-col xs:flex-row items-center justify-around gap-1.5 sm:gap-2">
          <button
            onClick={() => setShowFanCone(!showFanCone)}
            className={`w-full py-1.5 sm:py-2 px-2 sm:px-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              showFanCone 
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm" 
                : "text-slate-400 hover:text-slate-200 bg-slate-800/40"
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>Monte Carlo Cone</span>
          </button>

          <button
            onClick={() => setShowPastOverlay(!showPastOverlay)}
            className={`w-full py-1.5 sm:py-2 px-2 sm:px-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              showPastOverlay 
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm" 
                : "text-slate-400 hover:text-slate-200 bg-slate-800/40"
            }`}
          >
            <History className="w-3.5 h-3.5 text-amber-400" />
            <span>Past 7D Overlays</span>
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. MAIN PREDICTIVE TERMINAL CHART & RIGHT ANALYTICAL RAIL
      ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Chart Container (Left 2 Columns) */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col justify-between shadow-xl">
          <div>
            {/* Header: Title, Live Quote, Outlook Tag */}
            <div className="flex flex-wrap justify-between items-start gap-4 mb-4 pb-4 border-b border-slate-800/80">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="font-manrope font-extrabold text-xl text-white tracking-wide">
                    {data?.name || activeIndex.label}
                  </h2>
                  <span className="text-xs bg-indigo-500/20 text-cyan-300 border border-cyan-500/30 px-2.5 py-0.5 rounded-full font-bold">
                    7-Day Quant Outlook
                  </span>
                  <span className="text-[11px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded flex items-center gap-1 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    Live Feed
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                  <span>Last Session: <strong className="text-slate-300">{data?.last_market_date || "Today"}</strong></span>
                  <span>•</span>
                  <span>Auto-sync: 60s</span>
                  {data?.scenario_stress?.active && (
                    <span className="text-amber-400 bg-amber-500/10 px-2 py-0.2 rounded border border-amber-500/20">
                      Macro Stress Applied ({data.scenario_stress.drift_adjustment_pct > 0 ? "+" : ""}{data.scenario_stress.drift_adjustment_pct}% daily drift)
                    </span>
                  )}
                </p>
              </div>

              {/* Price Display */}
              <div className="text-right">
                <div className="text-2xl font-mono font-bold text-white tracking-tight">
                  ₹{data ? data.current_price.toLocaleString("en-IN", { minimumFractionDigits: 2 }) : "23,450.00"}
                </div>
                <div className={`text-xs font-semibold flex items-center justify-end gap-1 ${isPositive ? "text-emerald-400" : "text-rose-400"}`}>
                  {isPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                  <span>{isPositive ? "+" : ""}{data?.change?.toFixed(2) ?? "0.00"}</span>
                  <span>({isPositive ? "+" : ""}{data?.change_pct?.toFixed(2) ?? "0.00"}%)</span>
                </div>
              </div>
            </div>

            {/* Dynamic Chart Legend */}
            <div className="flex items-center gap-4 flex-wrap text-xs text-slate-400 mb-3 px-1">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-1 bg-emerald-400 rounded-full inline-block"></span>
                <span className="text-emerald-300">Actual Closes</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 border-t-2 border-dashed border-cyan-400 inline-block"></span>
                <span className="text-cyan-400 font-medium">P50 Expected Median</span>
              </div>
              {showFanCone && (
                <>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-2.5 bg-cyan-500/30 border border-cyan-500/60 rounded-xs inline-block"></span>
                    <span className="text-cyan-300">P25-P75 Core Corridor</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-2.5 bg-indigo-500/20 border border-indigo-500/40 rounded-xs inline-block"></span>
                    <span className="text-indigo-300">P10-P90 Risk Tails</span>
                  </div>
                </>
              )}
              {showPastOverlay && (
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 border-t-2 border-dotted border-amber-400 inline-block"></span>
                  <span className="text-amber-300 font-medium">Past Model Forecasts</span>
                </div>
              )}
            </div>

            {/* Chart Area */}
            <div className="h-72 sm:h-96 w-full relative">
              {loading ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/60 backdrop-blur-xs rounded-xl z-20">
                  <div className="w-10 h-10 border-2 border-indigo-500 border-t-cyan-400 rounded-full animate-spin mb-3"></div>
                  <p className="text-xs text-slate-400 font-medium tracking-wide">Computing Monte Carlo diffusion & telemetry...</p>
                </div>
              ) : null}

              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart 
                  data={data?.chart_data || []} 
                  margin={{ top: 14, right: 14, left: 10, bottom: 6 }}
                >
                  <defs>
                    {/* Actual History Gradient */}
                    <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                    </linearGradient>
                    {/* P90 Outer Fan Gradient */}
                    <linearGradient id="p90Gradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366F1" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#6366F1" stopOpacity={0.02}/>
                    </linearGradient>
                    {/* P75 Inner Fan Gradient */}
                    <linearGradient id="p75Gradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00F0FF" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#00F0FF" stopOpacity={0.05}/>
                    </linearGradient>
                  </defs>

                  <XAxis 
                    dataKey="display_date" 
                    axisLine={{ stroke: '#1e293b' }} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 11 }} 
                    dy={8} 
                  />
                  <YAxis 
                    domain={['dataMin - 120', 'dataMax + 120']} 
                    axisLine={{ stroke: '#1e293b' }} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 11 }} 
                    tickFormatter={(v) => `₹${Math.round(v).toLocaleString("en-IN")}`}
                    dx={-2}
                  />
                  <Tooltip content={<CustomTooltip />} />

                  {/* Reference Lines for Capital Protection */}
                  {data?.risk_parameters?.stop_loss && (
                    <ReferenceLine 
                      y={data.risk_parameters.stop_loss} 
                      stroke="#F43F5E" 
                      strokeDasharray="4 4" 
                      strokeWidth={1.5}
                      label={{ 
                        value: `Stop ₹${data.risk_parameters.stop_loss.toLocaleString("en-IN")}`, 
                        fill: '#F43F5E', 
                        fontSize: 10, 
                        position: 'insideBottomRight' 
                      }} 
                    />
                  )}
                  {data?.risk_parameters?.target_1 && (
                    <ReferenceLine 
                      y={data.risk_parameters.target_1} 
                      stroke="#10B981" 
                      strokeDasharray="4 4" 
                      strokeWidth={1.5}
                      label={{ 
                        value: `TP1 ₹${data.risk_parameters.target_1.toLocaleString("en-IN")}`, 
                        fill: '#10B981', 
                        fontSize: 10, 
                        position: 'insideTopRight' 
                      }} 
                    />
                  )}

                  {/* Feature 4: Monte Carlo 5-Percentile Fan Cone Bands */}
                  {showFanCone ? (
                    <>
                      {/* P90 Outer Shaded Layer */}
                      <Area 
                        type="monotone" 
                        dataKey="p90" 
                        stroke="none" 
                        fill="url(#p90Gradient)" 
                        isAnimationActive={false}
                      />
                      {/* P75 Core Shaded Layer */}
                      <Area 
                        type="monotone" 
                        dataKey="p75" 
                        stroke="none" 
                        fill="url(#p75Gradient)" 
                        isAnimationActive={false}
                      />
                      {/* P25 Mask Layer */}
                      <Area 
                        type="monotone" 
                        dataKey="p25" 
                        stroke="none" 
                        fill="#070a14" 
                        isAnimationActive={false}
                      />
                      {/* P10 Base Mask Layer */}
                      <Area 
                        type="monotone" 
                        dataKey="p10" 
                        stroke="none" 
                        fill="#05070D" 
                        isAnimationActive={false}
                      />
                    </>
                  ) : (
                    <>
                      {/* Standard Corridor */}
                      <Area 
                        type="monotone" 
                        dataKey="predictMax" 
                        stroke="none" 
                        fill="url(#p75Gradient)" 
                        isAnimationActive={false}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="predictMin" 
                        stroke="none" 
                        fill="#05070D" 
                        isAnimationActive={false}
                      />
                    </>
                  )}

                  {/* Feature 1: Historical Past Predictions Overlay */}
                  {showPastOverlay && (
                    <Line 
                      type="monotone" 
                      dataKey="past_forecast" 
                      stroke="#F59E0B" 
                      strokeWidth={2} 
                      strokeDasharray="3 3" 
                      dot={{ fill: "#F59E0B", r: 2.5 }}
                      isAnimationActive={true}
                    />
                  )}

                  {/* Median Forecast Trajectory Line (P50) */}
                  <Line 
                    type="monotone" 
                    dataKey="predictAvg" 
                    stroke="#00F0FF" 
                    strokeWidth={2.5} 
                    strokeDasharray="5 4" 
                    dot={false}
                    isAnimationActive={true}
                  />

                  {/* Actual Historical Closes Line */}
                  <Area 
                    type="monotone" 
                    dataKey="actual" 
                    stroke="#10B981" 
                    strokeWidth={3} 
                    fill="url(#actualGradient)" 
                    dot={{ fill: "#10B981", r: 3, strokeWidth: 1.5, stroke: "#ffffff" }}
                    isAnimationActive={true}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Quick Technical Bar below chart */}
          {data?.technicals && (
            <div className="mt-4 pt-4 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">20-Day EMA</span>
                <span className="font-mono font-bold text-slate-200">₹{data.technicals.ema_20.toLocaleString("en-IN")}</span>
              </div>
              <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">50-Day EMA</span>
                <span className="font-mono font-bold text-slate-200">₹{data.technicals.ema_50.toLocaleString("en-IN")}</span>
              </div>
              <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">14-Day RSI</span>
                <span className={`font-mono font-bold ${data.technicals.rsi_14 < 35 ? "text-emerald-400" : data.technicals.rsi_14 > 65 ? "text-amber-400" : "text-cyan-400"}`}>
                  {data.technicals.rsi_14.toFixed(1)}
                </span>
              </div>
              <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">14-Day ATR (Volatility)</span>
                <span className="font-mono font-bold text-indigo-300">±{data.technicals.atr_14.toFixed(1)} pts</span>
              </div>
            </div>
          )}
        </div>

        {/* Analytical Rail (Right Column) */}
        <div className="space-y-6 flex flex-col justify-between">
          
          {/* Feature 3: Options Chain & Smart Money Radar Card */}
          <div className="glass-panel p-5 rounded-2xl border border-indigo-500/30 bg-gradient-to-b from-[#0e1424] to-[#070b14] shadow-lg">
            <div className="flex items-center justify-between mb-3.5">
              <h3 className="font-manrope font-bold text-sm flex items-center gap-2 text-cyan-400">
                <Activity className="w-4 h-4 text-cyan-400" /> Smart Money Radar
              </h3>
              <span className="text-[10px] bg-indigo-500/20 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded font-mono font-semibold">
                F&O Telemetry
              </span>
            </div>

            <div className="space-y-3 text-xs">
              {/* PCR Dial & Sentiment */}
              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/90">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-slate-400">Put-Call Ratio (PCR):</span>
                  <span className="font-mono font-bold text-emerald-400 text-sm">
                    {data?.options_smart_money?.pcr_ratio ?? 1.14}
                  </span>
                </div>
                <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden mb-1.5">
                  <div 
                    className="h-full bg-gradient-to-r from-rose-500 via-amber-400 to-emerald-400 rounded-full"
                    style={{ width: `${Math.min(100, ((data?.options_smart_money?.pcr_ratio ?? 1.14) / 1.6) * 100)}%` }}
                  ></div>
                </div>
                <span className="text-[10px] text-emerald-300 font-semibold block">
                  {data?.options_smart_money?.pcr_sentiment ?? "Bullish Put Writing Support"}
                </span>
              </div>

              {/* Max Pain & OI Walls */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-slate-400 text-[10px] block">Max Pain Strike</span>
                  <span className="font-mono font-bold text-slate-200 text-sm">
                    ₹{data?.options_smart_money?.max_pain_strike?.toLocaleString("en-IN") ?? "23,400"}
                  </span>
                  <span className="text-[9px] text-slate-400 block mt-0.5">MM Sweet Spot</span>
                </div>

                <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-slate-400 text-[10px] block">Put OI Wall (Floor)</span>
                  <span className="font-mono font-bold text-emerald-400 text-sm">
                    ₹{data?.options_smart_money?.put_oi_wall?.toLocaleString("en-IN") ?? "23,200"}
                  </span>
                  <span className="text-[9px] text-emerald-500 block mt-0.5">Key Support Floor</span>
                </div>
              </div>

              {/* FII vs DII Net Cash Flow */}
              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/90">
                <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1.5">
                  Institutional Cash Flow
                </span>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-rose-400 font-mono text-[11px]">
                    FII Net: {data?.options_smart_money?.fii_net_flow_cr ?? -420} Cr
                  </span>
                  <span className="text-emerald-400 font-mono text-[11px]">
                    DII Net: +{data?.options_smart_money?.dii_net_flow_cr ?? 2140} Cr
                  </span>
                </div>
                <div className="p-1.5 bg-indigo-500/10 rounded border border-indigo-500/20 text-[10px] text-cyan-200">
                  {data?.options_smart_money?.net_institutional_bias ?? "Strong Domestic Institutional Absorption"}
                </div>
              </div>
            </div>
          </div>

          {/* Probability Matrix Panel */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 shadow-md">
            <div className="flex items-center justify-between mb-3.5">
              <h3 className="font-manrope font-bold text-sm text-slate-200 flex items-center gap-2">
                <Target className="w-4 h-4 text-emerald-400" /> Probability Matrix
              </h3>
              <span className="text-[10px] text-slate-400 font-mono">
                Monte Carlo Σ = 100%
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-300 font-medium">
                    Target ₹{data?.probability_matrix?.target_price?.toLocaleString("en-IN") || "23,800"}
                  </span>
                  <span className="text-emerald-400 font-bold font-mono">
                    {data?.probability_matrix?.target_prob ?? 48}%
                  </span>
                </div>
                <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-400 rounded-full transition-all duration-500"
                    style={{ width: `${data?.probability_matrix?.target_prob ?? 48}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-300 font-medium">Range Consolidation</span>
                  <span className="text-amber-400 font-bold font-mono">
                    {data?.probability_matrix?.consolidation_prob ?? 36}%
                  </span>
                </div>
                <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-amber-400 rounded-full transition-all duration-500"
                    style={{ width: `${data?.probability_matrix?.consolidation_prob ?? 36}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-300 font-medium">Downside Correction</span>
                  <span className="text-rose-400 font-bold font-mono">
                    {data?.probability_matrix?.correction_prob ?? 16}%
                  </span>
                </div>
                <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-rose-400 rounded-full transition-all duration-500"
                    style={{ width: `${data?.probability_matrix?.correction_prob ?? 16}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* AI Reasoning Highlights */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 shadow-md">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-manrope font-bold text-sm text-cyan-400 flex items-center gap-2">
                <Brain className="w-4 h-4 text-cyan-400" /> Multi-Factor Reasoning
              </h3>
              <span className="text-[10px] bg-cyan-500/10 text-cyan-300 px-2 py-0.5 rounded font-mono">
                FinBERT
              </span>
            </div>

            <div className="space-y-2 text-xs">
              {data?.ai_reasoning?.slice(0, 2).map((reason) => (
                <div key={reason.id} className="p-2.5 bg-slate-900/60 rounded-xl border border-slate-800">
                  <span className="font-semibold text-slate-200 block mb-0.5">{reason.title}</span>
                  <p className="text-slate-400 line-clamp-2 text-[11px]">{reason.desc}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* ─────────────────────────────────────────────────────────────
          4. FEATURE 2 & FEATURE 5: RISK GUARD & WHAT-IF MACRO SIMULATOR
      ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Feature 2: Interactive Position Sizing & Capital Guard */}
        <div className="glass-panel p-6 rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-[#0c1122] to-[#070b16] shadow-xl">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-xl">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-manrope font-bold text-base text-white">
                  Interactive Position Sizer & Risk Guard
                </h3>
                <p className="text-slate-400 text-xs">
                  Institutional capital preservation calculator protecting against ruin
                </p>
              </div>
            </div>

            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider ${
              isOverLeveraged 
                ? "bg-rose-500/20 text-rose-400 border border-rose-500/30" 
                : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
            }`}>
              {isOverLeveraged ? "⚠ OVER-LEVERAGED" : "✓ SAFE CAPITAL GUARD"}
            </span>
          </div>

          <div className="space-y-4">
            {/* Account Capital Controls */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="text-slate-300 font-medium flex items-center gap-1">
                  <Wallet className="w-3.5 h-3.5 text-cyan-400" /> Total Account Capital:
                </span>
                <span className="font-mono font-bold text-cyan-300 text-sm">
                  ₹{accountCapital.toLocaleString("en-IN")}
                </span>
              </div>

              {/* Capital Quick Presets */}
              <div className="flex items-center gap-1.5 mb-2.5 flex-wrap">
                {[50000, 100000, 250000, 500000, 1000000].map((cap) => (
                  <button
                    key={cap}
                    onClick={() => setAccountCapital(cap)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                      accountCapital === cap
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                    }`}
                  >
                    ₹{cap >= 100000 ? `${cap / 100000}L` : `${cap / 1000}K`}
                  </button>
                ))}
              </div>

              <input 
                type="range"
                min={25000}
                max={2500000}
                step={25000}
                value={accountCapital}
                onChange={(e) => setAccountCapital(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>

            {/* Risk % Selector and Instrument */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-slate-400 text-xs block mb-1.5">Max Risk per Trade (%):</span>
                <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                  {[1.0, 1.5, 2.0].map((r) => (
                    <button
                      key={r}
                      onClick={() => setRiskPct(r)}
                      className={`py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        riskPct === r
                          ? "bg-cyan-500 text-slate-950 shadow"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      {r}%
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-slate-400 text-xs block mb-1.5">Instrument:</span>
                <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-[10px]">
                  <button
                    onClick={() => setInstrumentType("futures")}
                    className={`py-1 rounded-lg font-bold transition-all cursor-pointer ${
                      instrumentType === "futures"
                        ? "bg-indigo-600 text-white"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Futures
                  </button>
                  <button
                    onClick={() => setInstrumentType("options")}
                    className={`py-1 rounded-lg font-bold transition-all cursor-pointer ${
                      instrumentType === "options"
                        ? "bg-indigo-600 text-white"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Options
                  </button>
                  <button
                    onClick={() => setInstrumentType("etf")}
                    className={`py-1 rounded-lg font-bold transition-all cursor-pointer ${
                      instrumentType === "etf"
                        ? "bg-indigo-600 text-white"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    ETF
                  </button>
                </div>
              </div>
            </div>

            {/* Dynamic Math Results Box */}
            <div className="p-3.5 bg-slate-950/70 rounded-xl border border-slate-800 space-y-2.5 text-xs font-mono">
              <div className="grid grid-cols-2 gap-3 pb-2.5 border-b border-slate-800/80">
                <div>
                  <span className="text-slate-400 font-sans text-[11px] block">Recommended Sizing:</span>
                  <span className="text-lg font-bold text-emerald-400">
                    {instrumentType === "etf" ? `${executedQty} Units` : `${safeLots} Lot${safeLots > 1 ? "s" : ""} (${executedQty} Qty)`}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-sans text-[11px] block">Max Rupee Risk (SL):</span>
                  <span className="text-lg font-bold text-rose-400">
                    -₹{totalRupeeRisk.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-[11px]">
                <div className="flex justify-between items-center text-slate-300">
                  <span className="text-slate-400 font-sans">Profit at TP1:</span>
                  <span className="text-emerald-400 font-semibold">+₹{potentialProfitTP1.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between items-center text-slate-300">
                  <span className="text-slate-400 font-sans">Profit at TP2:</span>
                  <span className="text-emerald-400 font-semibold">+₹{potentialProfitTP2.toLocaleString("en-IN")}</span>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 leading-snug">
              Stop-loss strictly placed at <strong className="text-rose-400 font-mono">₹{stopLoss.toLocaleString("en-IN")}</strong>. Point risk per share is <strong className="text-slate-200 font-mono">{pointRisk.toFixed(0)} pts</strong>.
            </p>
          </div>
        </div>

        {/* Feature 5: Dynamic What-If Macro Simulator */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 bg-gradient-to-br from-[#0c101d] to-[#070912] shadow-xl">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-manrope font-bold text-base text-white">
                  Dynamic &ldquo;What-If&rdquo; Macro Stress Simulator
                </h3>
                <p className="text-slate-400 text-xs">
                  Real-time scenario sensitivity modeling on index drift and target prices
                </p>
              </div>
            </div>

            {(crudeOilPct !== 0 || dxyPct !== 0 || rbiBps !== 0) && (
              <button
                onClick={resetMacroScenarios}
                className="px-2.5 py-1 rounded-lg text-xs bg-slate-800 hover:bg-slate-700 text-amber-300 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>

          <div className="space-y-4 text-xs">
            {/* Crude Oil Shift Slider */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-slate-300 font-medium">Crude Oil Shock:</span>
                <span className={`font-mono font-bold ${crudeOilPct > 0 ? "text-rose-400" : crudeOilPct < 0 ? "text-emerald-400" : "text-slate-400"}`}>
                  {crudeOilPct > 0 ? "+" : ""}{crudeOilPct}%
                </span>
              </div>
              <input 
                type="range"
                min={-10}
                max={10}
                step={1}
                value={crudeOilPct}
                onChange={(e) => handleCrudeChange(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-0.5 font-mono">
                <span>-10% (Disinflation Tailwind)</span>
                <span>0%</span>
                <span>+10% (Cost Inflation Drag)</span>
              </div>
            </div>

            {/* US Dollar Index (DXY) Slider */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-slate-300 font-medium">US Dollar Index (DXY) Shift:</span>
                <span className={`font-mono font-bold ${dxyPct > 0 ? "text-rose-400" : dxyPct < 0 ? "text-emerald-400" : "text-slate-400"}`}>
                  {dxyPct > 0 ? "+" : ""}{dxyPct}%
                </span>
              </div>
              <input 
                type="range"
                min={-3}
                max={3}
                step={0.5}
                value={dxyPct}
                onChange={(e) => handleDxyChange(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-0.5 font-mono">
                <span>-3% (EM Inflows)</span>
                <span>0%</span>
                <span>+3% (Dollar Squeeze)</span>
              </div>
            </div>

            {/* RBI Rate Policy Buttons */}
            <div>
              <span className="text-slate-300 font-medium block mb-1.5">RBI Repo Rate Action:</span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleRbiChange(-25)}
                  className={`py-1.5 px-2 rounded-xl font-bold transition-all cursor-pointer ${
                    rbiBps === -25
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                      : "bg-slate-900 text-slate-400 hover:bg-slate-800"
                  }`}
                >
                  -25 bps Rate Cut
                </button>
                <button
                  onClick={() => handleRbiChange(0)}
                  className={`py-1.5 px-2 rounded-xl font-bold transition-all cursor-pointer ${
                    rbiBps === 0
                      ? "bg-slate-700 text-white border border-slate-600"
                      : "bg-slate-900 text-slate-400 hover:bg-slate-800"
                  }`}
                >
                  0 bps Neutral
                </button>
                <button
                  onClick={() => handleRbiChange(25)}
                  className={`py-1.5 px-2 rounded-xl font-bold transition-all cursor-pointer ${
                    rbiBps === 25
                      ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                      : "bg-slate-900 text-slate-400 hover:bg-slate-800"
                  }`}
                >
                  +25 bps Rate Hike
                </button>
              </div>
            </div>

            {/* Live Net Drift Readout */}
            <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400">Net Macro Elasticity Impact:</span>
              <span className={`font-mono font-bold ${
                (data?.scenario_stress?.drift_adjustment_pct ?? 0) > 0 
                  ? "text-emerald-400" 
                  : (data?.scenario_stress?.drift_adjustment_pct ?? 0) < 0 
                  ? "text-rose-400" 
                  : "text-slate-300"
              }`}>
                {(data?.scenario_stress?.drift_adjustment_pct ?? 0) > 0 ? "+" : ""}
                {data?.scenario_stress?.drift_adjustment_pct ?? 0}% / session
              </span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
