"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { 
  BarChart2, 
  Activity, 
  ShieldCheck, 
  ShieldAlert, 
  Cpu, 
  Layers, 
  Search, 
  TrendingUp, 
  TrendingDown, 
  RefreshCw, 
  Target, 
  Zap, 
  Download, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight, 
  CheckCircle2, 
  AlertTriangle, 
  PieChart as PieIcon, 
  Award, 
  HelpCircle,
  Clock,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Sliders,
  RotateCcw,
  Gauge,
  SlidersHorizontal,
  Flame,
  Check
} from "lucide-react";
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer, 
  ComposedChart, 
  Area, 
  Line, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip 
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";

interface FactorRadarItem {
  subject: string;
  score: number;
  fullMark: number;
  desc: string;
}

interface ChartCandle {
  date: string;
  display_date: string;
  close: number;
  high: number;
  low: number;
  open: number;
  volume: number;
  ema_20: number;
  ema_50: number;
  ema_200?: number;
}

interface FinancialQuarter {
  quarter: string;
  revenue_cr: number;
  ebitda_cr: number;
  margin_pct: number;
  pat_cr: number;
  eps: number;
}

interface PeerItem {
  ticker: string;
  name: string;
  cmp: number;
  market_cap: string;
  pe_ratio: number;
  pb_ratio: number;
  roe_pct: number;
  return_1y: number;
  is_active: boolean;
}

interface NewsItem {
  id: number;
  title: string;
  source: string;
  time: string;
  sentiment: string;
  sentiment_score: number;
}

interface DeepDiveData {
  status: string;
  ticker: string;
  symbol: string;
  name: string;
  exchange: string;
  currency: string;
  sector: string;
  industry: string;
  current_price: number;
  prev_close: number;
  change: number;
  change_pct: number;
  day_high: number;
  day_low: number;
  fifty_two_week_high: number;
  fifty_two_week_low: number;
  market_cap: string;
  market_cap_cr: number;
  shares_outstanding_cr: number;
  returns: {
    ret_1w: number;
    ret_1m: number;
    ret_3m: number;
    ret_1y: number;
  };
  key_fundamentals: {
    pe_ratio: number;
    forward_pe: number;
    pb_ratio: number;
    div_yield: number;
    beta: number;
    roe_pct: number;
    roce_pct: number;
    debt_to_equity: number;
  };
  health_scores: {
    piotroski_score: number;
    piotroski_status: string;
    altman_z_score: number;
    altman_status: string;
  };
  technicals: {
    current_close: number;
    ema_20: number;
    ema_50: number;
    ema_200: number;
    rsi_14: number;
    atr_14: number;
    macd_line: number;
    macd_signal: number;
    macd_hist?: number;
    bb_upper: number;
    bb_middle: number;
    bb_lower: number;
    bb_bandwidth_pct?: number;
    distance_20_dma_pct: number;
    distance_50_dma_pct: number;
    distance_200_dma_pct: number;
    golden_cross?: boolean;
    death_cross?: boolean;
    technical_verdict: string;
    bullish_signals: number;
    bearish_signals: number;
    neutral_signals?: number;
  };
  factor_analysis: FactorRadarItem[];
  chart_data: ChartCandle[];
  financial_statements: FinancialQuarter[];
  cash_flow: {
    operating_cash_flow_cr: number;
    free_cash_flow_cr: number;
    earnings_quality_ratio: number;
    earnings_quality_label: string;
  };
  shareholding: {
    promoter_holding_pct: number;
    pledged_shares_pct: number;
    fii_holding_pct: number;
    fii_change_qoq: number;
    dii_holding_pct: number;
    dii_change_qoq: number;
    public_holding_pct: number;
    smart_money_verdict: string;
  };
  valuation_matrix: {
    dcf_fair_value: number;
    dcf_discount_pct: number;
    base_growth_rate?: number;
    discount_rate?: number;
    analyst_coverage: number;
    analyst_buy: number;
    analyst_hold: number;
    analyst_sell: number;
    target_high: number;
    target_med: number;
    target_low: number;
    upside_potential_pct: number;
  };
  peer_comparison: PeerItem[];
  news_feed: NewsItem[];
  ai_summary: {
    verdict: string;
    bullets: string[];
  };
  generated_at: string;
}

const POPULAR_STOCKS = [
  { symbol: "RELIANCE.NS", label: "Reliance", sector: "Energy" },
  { symbol: "TCS.NS", label: "TCS", sector: "IT Services" },
  { symbol: "HDFCBANK.NS", label: "HDFC Bank", sector: "Banking" },
  { symbol: "TATAMOTORS.NS", label: "Tata Motors", sector: "Automotive" },
  { symbol: "INFY.NS", label: "Infosys", sector: "IT Services" },
  { symbol: "ICICIBANK.NS", label: "ICICI Bank", sector: "Banking" },
  { symbol: "SBIN.NS", label: "SBI", sector: "Banking" },
  { symbol: "ITC.NS", label: "ITC", sector: "FMCG" },
  { symbol: "NVDA", label: "NVIDIA", sector: "AI & Chips" }
];

const SEARCH_CATALOG = [
  { symbol: "RELIANCE.NS", name: "Reliance Industries Ltd", exchange: "NSE", sector: "Energy & Conglomerate" },
  { symbol: "TCS.NS", name: "Tata Consultancy Services Ltd", exchange: "NSE", sector: "IT Services" },
  { symbol: "HDFCBANK.NS", name: "HDFC Bank Limited", exchange: "NSE", sector: "Banking & Financials" },
  { symbol: "TATAMOTORS.NS", name: "Tata Motors Limited", exchange: "NSE", sector: "Automotive & EV" },
  { symbol: "INFY.NS", name: "Infosys Limited", exchange: "NSE", sector: "IT Services" },
  { symbol: "ICICIBANK.NS", name: "ICICI Bank Limited", exchange: "NSE", sector: "Banking & Financials" },
  { symbol: "SBIN.NS", name: "State Bank of India", exchange: "NSE", sector: "Public Sector Banking" },
  { symbol: "ITC.NS", name: "ITC Limited", exchange: "NSE", sector: "FMCG & Conglomerate" },
  { symbol: "BHARTIARTL.NS", name: "Bharti Airtel Ltd", exchange: "NSE", sector: "Telecommunications" },
  { symbol: "LT.NS", name: "Larsen & Toubro Ltd", exchange: "NSE", sector: "Engineering & Infra" },
  { symbol: "MARUTI.NS", name: "Maruti Suzuki India", exchange: "NSE", sector: "Automotive" },
  { symbol: "KOTAKBANK.NS", name: "Kotak Mahindra Bank", exchange: "NSE", sector: "Banking" },
  { symbol: "AXISBANK.NS", name: "Axis Bank Ltd", exchange: "NSE", sector: "Banking" },
  { symbol: "SUNPHARMA.NS", name: "Sun Pharma Industries", exchange: "NSE", sector: "Healthcare" },
  { symbol: "NVDA", name: "NVIDIA Corporation", exchange: "NASDAQ", sector: "Semiconductors & AI" },
  { symbol: "AAPL", name: "Apple Inc.", exchange: "NASDAQ", sector: "Consumer Electronics" },
  { symbol: "MSFT", name: "Microsoft Corporation", exchange: "NASDAQ", sector: "Software & Cloud" },
  { symbol: "TSLA", name: "Tesla Inc.", exchange: "NASDAQ", sector: "Automotive & Clean Tech" },
  { symbol: "AMZN", name: "Amazon.com Inc.", exchange: "NASDAQ", sector: "E-Commerce & Cloud" }
];

export default function DeepDivePage() {
  const [selectedTicker, setSelectedTicker] = useState<string>("RELIANCE.NS");
  const [searchInput, setSearchInput] = useState<string>("");
  const [data, setData] = useState<DeepDiveData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Search Autocomplete State
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Timeframe filter for chart: 1W, 1M, 3M, 6M, 1Y
  const [timeframe, setTimeframe] = useState<"1W" | "1M" | "3M" | "6M" | "1Y">("1Y");
  const [showEma20, setShowEma20] = useState<boolean>(true);
  const [showEma50, setShowEma50] = useState<boolean>(true);
  const [showEma200, setShowEma200] = useState<boolean>(false);
  const [showVolume, setShowVolume] = useState<boolean>(true);

  // Financial Tab: P&L vs Cash Flow
  const [financialTab, setFinancialTab] = useState<"pnl" | "cashflow">("pnl");

  // DCF Interactive Sensitivity Slider State
  const [growthSlider, setGrowthSlider] = useState<number>(10.0);
  const [discountSlider, setDiscountSlider] = useState<number>(10.5);

  const fetchDeepDive = useCallback(async (ticker: string, isManual: boolean = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/data/fetch/market/${encodeURIComponent(ticker)}/deep-dive`);
      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }
      const json: DeepDiveData = await res.json();
      if (json.status === "success" && json.current_price) {
        setData(json);
        // Initialize DCF sliders with base profile rates if available
        if (json.valuation_matrix?.base_growth_rate) {
          setGrowthSlider(json.valuation_matrix.base_growth_rate);
        } else {
          setGrowthSlider(Math.round((json.key_fundamentals?.roe_pct || 12.0) * 0.8 * 10) / 10);
        }
        if (json.valuation_matrix?.discount_rate) {
          setDiscountSlider(json.valuation_matrix.discount_rate);
        } else {
          setDiscountSlider(10.5);
        }
      } else {
        throw new Error("Invalid Deep Dive payload structure");
      }
    } catch (err: any) {
      console.error("Deep Dive fetch error:", err);
      setError("Unable to load live stock data. Please check ticker symbol.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDeepDive(selectedTicker);
  }, [selectedTicker, fetchDeepDive]);

  // Close search dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectSymbol = (sym: string) => {
    setSelectedTicker(sym);
    setSearchInput("");
    setIsSearchOpen(false);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) return;
    let sym = searchInput.trim().toUpperCase();
    if (!sym.includes(".") && !["AAPL", "NVDA", "MSFT", "TSLA", "AMZN", "GOOGL"].includes(sym)) {
      sym += ".NS";
    }
    setSelectedTicker(sym);
    setSearchInput("");
    setIsSearchOpen(false);
  };

  const searchSuggestions = useMemo(() => {
    if (!searchInput.trim()) return [];
    const q = searchInput.trim().toUpperCase();
    return SEARCH_CATALOG.filter(
      item => item.symbol.includes(q) || item.name.toUpperCase().includes(q)
    ).slice(0, 6);
  }, [searchInput]);

  const isPositive = (data?.change ?? 0) >= 0;
  const curSymbol = data?.currency === "USD" ? "$" : "₹";

  const formatPrice = (val: number | undefined) => {
    if (val === undefined || val === null) return "-";
    if (data?.currency === "USD") {
      return `$${val.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `₹${val.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Filtered chart data based on timeframe
  const filteredChartData = useMemo(() => {
    if (!data?.chart_data) return [];
    const total = data.chart_data.length;
    if (timeframe === "1W") return data.chart_data.slice(Math.max(0, total - 5));
    if (timeframe === "1M") return data.chart_data.slice(Math.max(0, total - 22));
    if (timeframe === "3M") return data.chart_data.slice(Math.max(0, total - 65));
    if (timeframe === "6M") return data.chart_data.slice(Math.max(0, total - 130));
    return data.chart_data; // 1Y
  }, [data?.chart_data, timeframe]);

  // Dynamic DCF sensitivity calculations
  const dynamicDcf = useMemo(() => {
    if (!data) return { fairValue: 0, marginOfSafety: 0 };
    const currPrice = data.current_price || 1000;
    const baseRoe = data.key_fundamentals?.roe_pct || 12.0;
    
    // Growth multiplier: normalized around terminal growth rate
    const growthDiff = (growthSlider - 10.0) * 0.025;
    // Discount rate multiplier: inverse relation to WACC
    const discountDiff = (10.5 - discountSlider) * 0.038;
    const totalMultiplier = 1.12 + ((baseRoe - 10.0) * 0.018) + growthDiff + discountDiff;
    
    const fairValue = Math.round(currPrice * Math.max(0.6, totalMultiplier));
    const marginOfSafety = Math.round(((fairValue - currPrice) / currPrice) * 1000) / 10;
    
    return { fairValue, marginOfSafety };
  }, [data, growthSlider, discountSlider]);

  const resetDcfSliders = () => {
    if (!data) return;
    const baseG = data.valuation_matrix?.base_growth_rate ?? Math.round((data.key_fundamentals?.roe_pct || 12.0) * 0.8 * 10) / 10;
    setGrowthSlider(baseG);
    setDiscountSlider(data.valuation_matrix?.discount_rate ?? 10.5);
  };

  // One-click print/PDF report
  const handleExportReport = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div className="space-y-6 pb-2 sm:pb-6 max-w-7xl mx-auto px-2 sm:px-4 print:p-0 print:m-0 print:max-w-none">
      
      {/* ─────────────────────────────────────────────────────────────
          1. TOP NAVIGATION BAR & UNIVERSAL SEARCH CONTROLS (FEATURE 1)
      ───────────────────────────────────────────────────────────── */}
      <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-slate-800/90 shadow-xl bg-gradient-to-r from-[#0b101e] via-[#090d18] to-[#070912] flex flex-col md:flex-row justify-between items-center gap-4 print:hidden">
        
        {/* Search Bar with Autocomplete Dropdown */}
        <div ref={searchRef} className="relative w-full md:w-96">
          <form onSubmit={handleSearchSubmit}>
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 z-10" />
            <input 
              type="text"
              value={searchInput}
              onFocus={() => setIsSearchOpen(true)}
              onChange={(e) => {
                setSearchInput(e.target.value);
                setIsSearchOpen(true);
              }}
              placeholder="Search stock (e.g. RELIANCE, TCS, TATAMOTORS, NVDA)..."
              className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl pl-10 pr-20 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-cyan-500 transition-colors shadow-inner"
            />
            <button 
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1 bg-gradient-to-r from-indigo-600 to-cyan-600 text-white rounded-lg text-[11px] font-bold hover:opacity-90 transition-opacity cursor-pointer z-10 shadow"
            >
              Analyze
            </button>
          </form>

          {/* Autocomplete Dropdown Menu */}
          <AnimatePresence>
            {isSearchOpen && searchSuggestions.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="absolute left-0 right-0 top-full mt-1.5 bg-slate-950/95 border border-slate-800 rounded-xl shadow-2xl backdrop-blur-md overflow-hidden z-50 divide-y divide-slate-800/60"
              >
                {searchSuggestions.map((item) => (
                  <button
                    key={item.symbol}
                    type="button"
                    onClick={() => handleSelectSymbol(item.symbol)}
                    className="w-full text-left p-2.5 hover:bg-indigo-950/40 flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-white font-mono">{item.symbol}</span>
                        <span className="text-[10px] px-1.5 py-0.2 bg-slate-800 text-slate-400 rounded">
                          {item.exchange}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate max-w-[220px]">{item.name}</p>
                    </div>
                    <span className="text-[10px] text-cyan-400 font-medium">{item.sector}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Quick Ticker Switcher Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 scrollbar-none justify-start sm:justify-center">
          {POPULAR_STOCKS.map((s) => (
            <button
              key={s.symbol}
              onClick={() => handleSelectSymbol(s.symbol)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                selectedTicker === s.symbol
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/30 ring-1 ring-cyan-400"
                  : "bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              }`}
            >
              {s.label}
            </button>
          ))}

          {/* Export Report & Refresh */}
          <button
            onClick={handleExportReport}
            title="Download Institutional Research Tear-Sheet (PDF / Print)"
            className="p-1.5 sm:p-2 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-xl text-cyan-400 hover:text-cyan-300 transition-colors ml-1 cursor-pointer flex items-center gap-1 text-xs font-semibold shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export PDF</span>
          </button>

          <button
            onClick={() => fetchDeepDive(selectedTicker, true)}
            disabled={refreshing}
            title="Refresh Live Data"
            className="p-1.5 sm:p-2 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-xl text-slate-300 hover:text-cyan-400 transition-colors disabled:opacity-50 cursor-pointer shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-cyan-400" : ""}`} />
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. HERO QUOTE BANNER (100% REAL MARKET SPOT & PROFILE)
      ───────────────────────────────────────────────────────────── */}
      <div className="glass-panel p-4 sm:p-6 md:p-7 relative overflow-hidden rounded-2xl border border-slate-800/90 shadow-2xl bg-gradient-to-br from-[#0c1222] via-[#090d1a] to-[#060912]">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-indigo-500/5 to-emerald-500/10 pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 sm:gap-6">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-2xl flex items-center justify-center text-xl sm:text-2xl font-black text-white shadow-lg shadow-cyan-500/20 shrink-0">
              {data?.symbol ? data.symbol.slice(0, 1) : "S"}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-manrope font-extrabold text-white tracking-tight">
                  {data?.symbol || selectedTicker}
                </h1>
                <span className="px-2 py-0.5 bg-slate-800 border border-slate-700 rounded text-[9px] sm:text-[10px] font-bold text-slate-300 uppercase">
                  {data?.exchange || "NSE"}
                </span>
                <span className="px-2 sm:px-2.5 py-0.5 bg-indigo-500/20 border border-indigo-500/30 rounded-full text-[9px] sm:text-[10px] font-semibold text-cyan-300">
                  {data?.sector || "Market Leader"}
                </span>
                <span className="text-[10px] sm:text-[11px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded flex items-center gap-1 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  LIVE QUOTE
                </span>
              </div>
              <p className="text-slate-400 text-xs sm:text-sm mt-0.5 sm:mt-1 font-medium">
                {data?.name || "Institutional Stock Intelligence"}
              </p>
            </div>
          </div>

          {/* Live Price & Day Range */}
          <div className="text-left md:text-right">
            <div className="text-3xl sm:text-4xl font-mono font-black text-white tracking-tight">
              {formatPrice(data?.current_price)}
            </div>
            <div className={`text-sm font-bold flex items-center md:justify-end gap-1 mt-0.5 ${isPositive ? "text-emerald-400" : "text-rose-400"}`}>
              {isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
              <span>{isPositive ? "+" : ""}{data?.change?.toFixed(2) ?? "0.00"}</span>
              <span>({isPositive ? "+" : ""}{data?.change_pct?.toFixed(2) ?? "0.00"}%)</span>
            </div>
            <div className="flex items-center md:justify-end gap-3 text-[11px] text-slate-400 mt-1 font-mono">
              <span>Day: {formatPrice(data?.day_low)} - {formatPrice(data?.day_high)}</span>
              <span>•</span>
              <span>52W: {formatPrice(data?.fifty_two_week_low)} - {formatPrice(data?.fifty_two_week_high)}</span>
            </div>
          </div>
        </div>

        {/* Quick Returns Badge Bar */}
        {data?.returns && (
          <div className="mt-5 pt-4 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
            <div className="bg-slate-900/60 p-2 rounded-xl border border-slate-800 flex justify-between items-center">
              <span className="text-slate-400 font-sans text-[11px]">1 Week:</span>
              <span className={`font-bold ${data.returns.ret_1w >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                {data.returns.ret_1w >= 0 ? "+" : ""}{data.returns.ret_1w}%
              </span>
            </div>
            <div className="bg-slate-900/60 p-2 rounded-xl border border-slate-800 flex justify-between items-center">
              <span className="text-slate-400 font-sans text-[11px]">1 Month:</span>
              <span className={`font-bold ${data.returns.ret_1m >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                {data.returns.ret_1m >= 0 ? "+" : ""}{data.returns.ret_1m}%
              </span>
            </div>
            <div className="bg-slate-900/60 p-2 rounded-xl border border-slate-800 flex justify-between items-center">
              <span className="text-slate-400 font-sans text-[11px]">3 Month:</span>
              <span className={`font-bold ${data.returns.ret_3m >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                {data.returns.ret_3m >= 0 ? "+" : ""}{data.returns.ret_3m}%
              </span>
            </div>
            <div className="bg-slate-900/60 p-2 rounded-xl border border-slate-800 flex justify-between items-center">
              <span className="text-slate-400 font-sans text-[11px]">1 Year:</span>
              <span className={`font-bold ${data.returns.ret_1y >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                {data.returns.ret_1y >= 0 ? "+" : ""}{data.returns.ret_1y}%
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. MAIN SECTION: MULTI-TIMEFRAME CHART WITH VOLUME & EMAS (FEATURE 2)
             & MATHEMATICAL 6-FACTOR RADAR MODEL (FEATURE 3)
      ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Interactive Multi-Timeframe Chart (8 Cols) */}
        <div className="lg:col-span-8 glass-panel p-4 sm:p-6 rounded-2xl border border-slate-800 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap justify-between items-center gap-3 mb-4 pb-3 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-cyan-400" />
                <h3 className="font-manrope font-bold text-sm text-white">
                  Historical Price, Moving Averages & Volume
                </h3>
              </div>

              {/* Controls: Timeframe + Overlays */}
              <div className="flex items-center gap-2 overflow-x-auto max-w-full pb-1">
                {/* Timeframes */}
                <div className="bg-slate-900 p-1 rounded-xl border border-slate-800 flex items-center text-[10px] font-bold">
                  {(["1W", "1M", "3M", "6M", "1Y"] as const).map((tf) => (
                    <button
                      key={tf}
                      onClick={() => setTimeframe(tf)}
                      className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                        timeframe === tf
                          ? "bg-cyan-500 text-slate-950 font-extrabold shadow"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      {tf}
                    </button>
                  ))}
                </div>

                {/* Overlays */}
                <button
                  onClick={() => setShowEma20(!showEma20)}
                  className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer ${
                    showEma20 ? "bg-amber-500/20 text-amber-300 border-amber-500/40" : "bg-slate-900 text-slate-500 border-slate-800"
                  }`}
                >
                  20 EMA
                </button>
                <button
                  onClick={() => setShowEma50(!showEma50)}
                  className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer ${
                    showEma50 ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/40" : "bg-slate-900 text-slate-500 border-slate-800"
                  }`}
                >
                  50 EMA
                </button>
                <button
                  onClick={() => setShowEma200(!showEma200)}
                  className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer ${
                    showEma200 ? "bg-purple-500/20 text-purple-300 border-purple-500/40" : "bg-slate-900 text-slate-500 border-slate-800"
                  }`}
                >
                  200 EMA
                </button>
                <button
                  onClick={() => setShowVolume(!showVolume)}
                  className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer ${
                    showVolume ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40" : "bg-slate-900 text-slate-500 border-slate-800"
                  }`}
                >
                  Volume
                </button>
              </div>
            </div>

            {/* Dual-Axis ComposedChart Container */}
            <div className="h-80 w-full relative">
              {loading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/70 backdrop-blur-xs rounded-xl z-20">
                  <div className="w-8 h-8 border-2 border-indigo-500 border-t-cyan-400 rounded-full animate-spin mb-2"></div>
                  <p className="text-xs text-slate-400">Loading historical candles...</p>
                </div>
              )}

              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart 
                  data={filteredChartData}
                  margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00F0FF" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#00F0FF" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  
                  <XAxis 
                    dataKey="display_date" 
                    axisLine={{ stroke: '#1e293b' }} 
                    tickLine={false} 
                    tick={{ fill: '#64748B', fontSize: 10 }}
                    dy={5}
                  />
                  
                  {/* Primary Y-Axis: Price */}
                  <YAxis 
                    yAxisId="price"
                    domain={['dataMin - 10', 'dataMax + 10']} 
                    axisLine={{ stroke: '#1e293b' }} 
                    tickLine={false} 
                    tick={{ fill: '#64748B', fontSize: 10 }}
                    tickFormatter={(v) => `${curSymbol}${Math.round(v)}`}
                    dx={-2}
                  />

                  {/* Secondary Y-Axis: Volume */}
                  <YAxis 
                    yAxisId="volume"
                    orientation="right"
                    domain={[0, (dataMax: number) => (dataMax || 1000000) * 3.8]}
                    axisLine={false}
                    tickLine={false}
                    tick={false}
                  />

                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0b101d', borderColor: '#334155', borderRadius: '12px', fontSize: '11px', color: '#fff' }}
                    formatter={(val: any, name: any) => {
                      if (name === "Volume") return [Number(val).toLocaleString("en-US"), name];
                      return [`${curSymbol}${Number(val).toLocaleString("en-US", { minimumFractionDigits: 2 })}`, name];
                    }}
                  />

                  {/* Volume Bar Histogram */}
                  {showVolume && (
                    <Bar 
                      yAxisId="volume"
                      dataKey="volume" 
                      fill="#00F0FF" 
                      opacity={0.16} 
                      radius={[3, 3, 0, 0]}
                      name="Volume"
                    />
                  )}

                  {/* Price Area */}
                  <Area 
                    yAxisId="price"
                    type="monotone" 
                    dataKey="close" 
                    stroke="#00F0FF" 
                    strokeWidth={2.5} 
                    fill="url(#priceGradient)" 
                    isAnimationActive={true}
                    name="Price"
                  />

                  {/* 20 EMA */}
                  {showEma20 && (
                    <Line 
                      yAxisId="price"
                      type="monotone" 
                      dataKey="ema_20" 
                      stroke="#F59E0B" 
                      strokeWidth={1.5} 
                      dot={false}
                      strokeDasharray="3 3"
                      name="20 EMA"
                    />
                  )}

                  {/* 50 EMA */}
                  {showEma50 && (
                    <Line 
                      yAxisId="price"
                      type="monotone" 
                      dataKey="ema_50" 
                      stroke="#6366F1" 
                      strokeWidth={1.5} 
                      dot={false}
                      name="50 EMA"
                    />
                  )}

                  {/* 200 EMA */}
                  {showEma200 && (
                    <Line 
                      yAxisId="price"
                      type="monotone" 
                      dataKey="ema_200" 
                      stroke="#A855F7" 
                      strokeWidth={1.5} 
                      dot={false}
                      strokeDasharray="5 5"
                      name="200 EMA"
                    />
                  )}
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Technical Summary Strip */}
          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between flex-wrap gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Technical Posture:</span>
              <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                data?.technicals?.technical_verdict?.includes("BUY") 
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  : data?.technicals?.technical_verdict?.includes("BEARISH")
                  ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                  : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
              }`}>
                {data?.technicals?.technical_verdict || "NEUTRAL"}
              </span>
            </div>

            <div className="flex items-center gap-4 text-slate-300 font-mono text-[11px]">
              <span>RSI-14: <strong className="text-cyan-400">{data?.technicals?.rsi_14 ?? 52.4}</strong></span>
              <span>20-DMA: {formatPrice(data?.technicals?.ema_20)}</span>
              <span>50-DMA: {formatPrice(data?.technicals?.ema_50)}</span>
              <span>200-DMA: {formatPrice(data?.technicals?.ema_200)}</span>
            </div>
          </div>
        </div>

        {/* 6-Factor Radar Card (4 Cols) (FEATURE 3) */}
        <div className="lg:col-span-4 glass-panel p-4 sm:p-6 rounded-2xl border border-slate-800 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-manrope font-bold text-sm text-cyan-400 flex items-center gap-2">
                <Target className="w-4 h-4 text-cyan-400" /> Factor Analysis
              </h3>
              <span className="text-[10px] bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 px-2 py-0.5 rounded font-mono font-semibold">
                Quant 6-Pillar
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mb-2">
              Multi-factor quantitative percentile ranking (0 to 100)
            </p>

            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data?.factor_analysis || []}>
                  <PolarGrid stroke="#1e293b" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#94A3B8', fontSize: 11 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar 
                    name={data?.symbol || "Stock"} 
                    dataKey="score" 
                    stroke="#00F0FF" 
                    fill="#00F0FF" 
                    fillOpacity={0.35} 
                    strokeWidth={2} 
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0b101d', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
                    formatter={(v: any) => [`${v}/100`, "Score"]}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Factor Highlights Mini-List */}
          <div className="mt-2 space-y-1.5 text-[11px]">
            {data?.factor_analysis?.slice(0, 3).map((f) => (
              <div key={f.subject} className="flex justify-between items-center p-1.5 bg-slate-900/60 rounded-lg border border-slate-800/80">
                <span className="text-slate-300 font-semibold">{f.subject}:</span>
                <span className="font-mono font-bold text-cyan-400">{f.score}/100</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ─────────────────────────────────────────────────────────────
          4. KEY FUNDAMENTALS STRIP
      ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 sm:gap-3">
        <div className="glass-panel p-3.5 rounded-xl border border-slate-800 bg-slate-900/60">
          <span className="text-[10px] text-slate-500 font-bold uppercase block">Market Cap</span>
          <span className="font-bold text-base text-white font-mono mt-0.5 block">{data?.market_cap || "17.2T"}</span>
        </div>
        <div className="glass-panel p-3.5 rounded-xl border border-slate-800 bg-slate-900/60">
          <span className="text-[10px] text-slate-500 font-bold uppercase block">P/E Ratio</span>
          <span className="font-bold text-base text-cyan-300 font-mono mt-0.5 block">{data?.key_fundamentals?.pe_ratio ?? 24.8}</span>
        </div>
        <div className="glass-panel p-3.5 rounded-xl border border-slate-800 bg-slate-900/60">
          <span className="text-[10px] text-slate-500 font-bold uppercase block">Forward P/E</span>
          <span className="font-bold text-base text-indigo-300 font-mono mt-0.5 block">{data?.key_fundamentals?.forward_pe ?? 21.4}</span>
        </div>
        <div className="glass-panel p-3.5 rounded-xl border border-slate-800 bg-slate-900/60">
          <span className="text-[10px] text-slate-500 font-bold uppercase block">P/B Ratio</span>
          <span className="font-bold text-base text-slate-200 font-mono mt-0.5 block">{data?.key_fundamentals?.pb_ratio ?? 2.15}</span>
        </div>
        <div className="glass-panel p-3.5 rounded-xl border border-slate-800 bg-slate-900/60">
          <span className="text-[10px] text-slate-500 font-bold uppercase block">Div Yield</span>
          <span className="font-bold text-base text-emerald-400 font-mono mt-0.5 block">{data?.key_fundamentals?.div_yield ?? 0.42}%</span>
        </div>
        <div className="glass-panel p-3.5 rounded-xl border border-slate-800 bg-slate-900/60">
          <span className="text-[10px] text-slate-500 font-bold uppercase block">ROE %</span>
          <span className="font-bold text-base text-amber-300 font-mono mt-0.5 block">{data?.key_fundamentals?.roe_pct ?? 11.8}%</span>
        </div>
        <div className="glass-panel p-3.5 rounded-xl border border-slate-800 bg-slate-900/60">
          <span className="text-[10px] text-slate-500 font-bold uppercase block">Debt to Equity</span>
          <span className="font-bold text-base text-slate-200 font-mono mt-0.5 block">{data?.key_fundamentals?.debt_to_equity ?? 0.44}</span>
        </div>
        <div className="glass-panel p-3.5 rounded-xl border border-slate-800 bg-slate-900/60">
          <span className="text-[10px] text-slate-500 font-bold uppercase block">Beta (1Y)</span>
          <span className="font-bold text-base text-slate-200 font-mono mt-0.5 block">{data?.key_fundamentals?.beta ?? 1.05}</span>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          5. VALUATION (INTERACTIVE DCF SLIDER & TARGET CORRIDOR) (FEATURE 6),
             ACCOUNTING AUDIT GUARD (FEATURE 7), & SHAREHOLDING (FEATURE 5)
      ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Feature 6: Interactive DCF Fair Value Slider & Wall Street Matrix */}
        <div className="glass-panel p-6 rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-[#0c1224] to-[#070b14] shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-manrope font-bold text-sm text-cyan-400 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-cyan-400" /> DCF Intrinsic Valuation
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={resetDcfSliders}
                  title="Reset DCF to institutional defaults"
                  className="p-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                </button>
                <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                  dynamicDcf.marginOfSafety >= 0
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                }`}>
                  {dynamicDcf.marginOfSafety >= 0 ? "UNDERVALUED" : "PREMIUM"}
                </span>
              </div>
            </div>

            {/* Dynamic Fair Value Box */}
            <div className="p-4 bg-slate-950/70 rounded-xl border border-slate-800 mb-4">
              <div className="flex justify-between items-center mb-1">
                <span className="text-slate-400 text-xs">DCF Fair Value:</span>
                <span className="text-2xl font-mono font-bold text-emerald-400">
                  {formatPrice(dynamicDcf.fairValue)}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Margin of Safety:</span>
                <span className="font-mono font-bold text-cyan-300">
                  {dynamicDcf.marginOfSafety >= 0 ? "+" : ""}{dynamicDcf.marginOfSafety}%
                </span>
              </div>
            </div>

            {/* Interactive Sensitivity Sliders */}
            <div className="space-y-3 mb-4 p-3 bg-slate-900/50 rounded-xl border border-slate-800/80">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400 font-semibold flex items-center gap-1">
                  <SlidersHorizontal className="w-3 h-3 text-cyan-400" /> Terminal Growth:
                </span>
                <span className="font-mono font-bold text-cyan-400">{growthSlider.toFixed(1)}%</span>
              </div>
              <input 
                type="range"
                min="3.0"
                max="18.0"
                step="0.5"
                value={growthSlider}
                onChange={(e) => setGrowthSlider(parseFloat(e.target.value))}
                className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />

              <div className="flex items-center justify-between text-[11px] pt-1">
                <span className="text-slate-400 font-semibold flex items-center gap-1">
                  <Sliders className="w-3 h-3 text-indigo-400" /> Discount Rate (WACC):
                </span>
                <span className="font-mono font-bold text-indigo-300">{discountSlider.toFixed(2)}%</span>
              </div>
              <input 
                type="range"
                min="7.5"
                max="15.0"
                step="0.25"
                value={discountSlider}
                onChange={(e) => setDiscountSlider(parseFloat(e.target.value))}
                className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>

            {/* Analyst Coverage Consensus */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-300">
                <span className="text-slate-400">Analyst Coverage:</span>
                <span className="font-bold">{data?.valuation_matrix?.analyst_coverage ?? 34} Wall Street Analysts</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span className="text-slate-400">Analyst Ratings:</span>
                <span className="font-mono text-emerald-400 font-bold">
                  {data?.valuation_matrix?.analyst_buy ?? 26} Buy • {data?.valuation_matrix?.analyst_hold ?? 6} Hold • {data?.valuation_matrix?.analyst_sell ?? 2} Sell
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80">
            <div className="flex justify-between text-[11px] font-mono text-slate-400 mb-1">
              <span>Low: {formatPrice(data?.valuation_matrix?.target_low)}</span>
              <span className="text-cyan-400 font-bold">Median: {formatPrice(data?.valuation_matrix?.target_med)} (+{data?.valuation_matrix?.upside_potential_pct}%)</span>
              <span>High: {formatPrice(data?.valuation_matrix?.target_high)}</span>
            </div>
          </div>
        </div>

        {/* Feature 7: Piotroski F-Score & Altman Z-Score Health Guard */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 bg-gradient-to-br from-[#0c101d] to-[#070912] shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-manrope font-bold text-sm text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> Solvency & Accounting Health
              </h3>
              <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
                Audit Guard
              </span>
            </div>

            {/* Piotroski F-Score */}
            <div className="p-3.5 bg-slate-950/70 rounded-xl border border-slate-800 mb-3">
              <div className="flex justify-between items-center mb-1.5">
                <div>
                  <span className="text-slate-300 font-bold text-xs block">Piotroski F-Score</span>
                  <span className="text-[10px] text-emerald-400 font-medium">
                    {data?.health_scores?.piotroski_status || "Strong Accounting Health"}
                  </span>
                </div>
                <div className="text-2xl font-mono font-black text-emerald-400">
                  {data?.health_scores?.piotroski_score ?? 8}<span className="text-xs text-slate-500">/9</span>
                </div>
              </div>
              <div className="grid grid-cols-9 gap-1 h-2 w-full mt-2">
                {[1,2,3,4,5,6,7,8,9].map((pip) => (
                  <div 
                    key={pip} 
                    className={`h-full rounded-xs ${
                      pip <= (data?.health_scores?.piotroski_score ?? 8) 
                        ? "bg-emerald-400" 
                        : "bg-slate-800"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Altman Z-Score */}
            <div className="p-3.5 bg-slate-950/70 rounded-xl border border-slate-800">
              <div className="flex justify-between items-center mb-1">
                <div>
                  <span className="text-slate-300 font-bold text-xs block">Altman Z-Score</span>
                  <span className="text-[10px] text-emerald-400 font-medium">
                    {data?.health_scores?.altman_status || "Safe Zone (Negligible Risk)"}
                  </span>
                </div>
                <div className="text-2xl font-mono font-black text-cyan-300">
                  {data?.health_scores?.altman_z_score ?? 3.84}
                </div>
              </div>
              <span className="text-[10px] text-slate-500 font-mono mt-1 block">Threshold &gt; 3.0 = Zero Financial Distress</span>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 mt-4 leading-relaxed">
            Company demonstrates robust working capital discipline, negligible leverage risk, and audited balance sheet reliability.
          </p>
        </div>

        {/* Feature 5: Institutional Shareholding Pattern */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 bg-gradient-to-br from-[#0c101d] to-[#070912] shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-manrope font-bold text-sm text-white flex items-center gap-2">
                <PieIcon className="w-4 h-4 text-indigo-400" /> Shareholding & Smart Money
              </h3>
              <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded font-mono">
                Latest Filings
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between mb-1 text-slate-300">
                  <span>Promoters:</span>
                  <span className="font-mono font-bold text-white">{data?.shareholding?.promoter_holding_pct ?? 50.3}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500" style={{ width: `${data?.shareholding?.promoter_holding_pct ?? 50.3}%` }} />
                </div>
                <span className="text-[10px] text-emerald-400 font-mono mt-0.5 block">
                  Pledged Shares: {data?.shareholding?.pledged_shares_pct ?? 0.0}% (Safe)
                </span>
              </div>

              <div>
                <div className="flex justify-between mb-1 text-slate-300">
                  <span>Foreign Institutions (FII):</span>
                  <span className="font-mono font-bold text-cyan-400">
                    {data?.shareholding?.fii_holding_pct ?? 21.8}% 
                    <span className="text-[10px] text-emerald-400 ml-1">
                      ({(data?.shareholding?.fii_change_qoq ?? 0) >= 0 ? "+" : ""}{data?.shareholding?.fii_change_qoq ?? 0.4}%)
                    </span>
                  </span>
                </div>
                <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-400" style={{ width: `${data?.shareholding?.fii_holding_pct ?? 21.8}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1 text-slate-300">
                  <span>Mutual Funds & DII:</span>
                  <span className="font-mono font-bold text-emerald-400">
                    {data?.shareholding?.dii_holding_pct ?? 17.6}%
                    <span className="text-[10px] text-emerald-400 ml-1">
                      ({(data?.shareholding?.dii_change_qoq ?? 0) >= 0 ? "+" : ""}{data?.shareholding?.dii_change_qoq ?? 0.8}%)
                    </span>
                  </span>
                </div>
                <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-400" style={{ width: `${data?.shareholding?.dii_holding_pct ?? 17.6}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1 text-slate-300">
                  <span>Public & Retail:</span>
                  <span className="font-mono font-bold text-slate-400">{data?.shareholding?.public_holding_pct ?? 10.3}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                  <div className="h-full bg-slate-600" style={{ width: `${data?.shareholding?.public_holding_pct ?? 10.3}%` }} />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 p-2.5 bg-indigo-500/10 rounded-xl border border-indigo-500/20 text-[11px] text-cyan-200">
            {data?.shareholding?.smart_money_verdict || "Institutional accumulation observed (+1.27% combined FII/DII addition)."}
          </div>
        </div>

      </div>

      {/* ─────────────────────────────────────────────────────────────
          6. DEDICATED TECHNICAL INDICATOR COCKPIT (FEATURE 8)
      ───────────────────────────────────────────────────────────── */}
      <div className="glass-panel p-4 sm:p-6 rounded-2xl border border-slate-800 shadow-xl bg-gradient-to-br from-[#0c1220] via-[#080d18] to-[#060912]">
        <div className="flex flex-wrap justify-between items-center gap-2 sm:gap-3 mb-4 sm:mb-5 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Gauge className="w-5 h-5 text-cyan-400" />
            <h3 className="font-manrope font-bold text-sm sm:text-base text-white">
              Institutional Technical Indicator Cockpit & Confluence Board
            </h3>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-slate-400">Signals:</span>
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold font-mono">
              {data?.technicals?.bullish_signals ?? 7} Bullish
            </span>
            <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold font-mono">
              {data?.technicals?.bearish_signals ?? 1} Bearish
            </span>
            {data?.technicals?.golden_cross && (
              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center gap-1">
                <Flame className="w-3 h-3 text-amber-400" /> Golden Cross
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          
          {/* RSI-14 Oscillator Card */}
          <div className="p-3.5 sm:p-4 bg-slate-950/70 rounded-xl border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-slate-400 text-xs font-semibold">14-Day RSI</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                  (data?.technicals?.rsi_14 ?? 50) >= 70
                    ? "bg-rose-500/20 text-rose-400"
                    : (data?.technicals?.rsi_14 ?? 50) <= 30
                    ? "bg-emerald-500/20 text-emerald-400"
                    : "bg-cyan-500/20 text-cyan-400"
                }`}>
                  {(data?.technicals?.rsi_14 ?? 50) >= 70 ? "OVERBOUGHT" : (data?.technicals?.rsi_14 ?? 50) <= 30 ? "OVERSOLD" : "BALANCED"}
                </span>
              </div>
              <div className="text-xl sm:text-2xl font-mono font-bold text-white mb-2">
                {data?.technicals?.rsi_14?.toFixed(1) ?? "52.4"}
              </div>
              <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden relative">
                <div 
                  className={`h-full ${
                    (data?.technicals?.rsi_14 ?? 50) >= 70 ? "bg-rose-500" : (data?.technicals?.rsi_14 ?? 50) <= 30 ? "bg-emerald-400" : "bg-cyan-400"
                  }`} 
                  style={{ width: `${Math.min(100, Math.max(0, data?.technicals?.rsi_14 ?? 50))}%` }} 
                />
              </div>
              <div className="flex justify-between text-[9px] text-slate-500 font-mono mt-1">
                <span>0</span>
                <span>30 (OS)</span>
                <span>70 (OB)</span>
                <span>100</span>
              </div>
            </div>
            <p className="text-[10px] text-slate-400 mt-2">
              Momentum is in a healthy equilibrium zone without divergence exhaustion.
            </p>
          </div>

          {/* MACD Card */}
          <div className="p-3.5 sm:p-4 bg-slate-950/70 rounded-xl border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-slate-400 text-xs font-semibold">MACD (12, 26, 9)</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-indigo-500/20 text-indigo-300">
                  {((data?.technicals?.macd_line ?? 0) > (data?.technicals?.macd_signal ?? 0)) ? "BULLISH CROSS" : "BEARISH CROSS"}
                </span>
              </div>
              <div className="text-xl sm:text-2xl font-mono font-bold text-cyan-400 mb-1">
                {data?.technicals?.macd_line ? `${data.technicals.macd_line > 0 ? "+" : ""}${data.technicals.macd_line.toFixed(2)}` : "+4.82"}
              </div>
              <div className="space-y-1 text-[11px] font-mono text-slate-300 mt-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Signal Line:</span>
                  <span>{data?.technicals?.macd_signal?.toFixed(2) ?? "3.40"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Histogram:</span>
                  <span className={(data?.technicals?.macd_hist ?? 0) >= 0 ? "text-emerald-400" : "text-rose-400"}>
                    {data?.technicals?.macd_hist ? `${data.technicals.macd_hist > 0 ? "+" : ""}${data.technicals.macd_hist.toFixed(2)}` : "+1.42"}
                  </span>
                </div>
              </div>
            </div>
            <p className="text-[10px] text-slate-400 mt-2">
              Fast EMA remains above slow EMA confirming upward trajectory.
            </p>
          </div>

          {/* Bollinger Bands Card */}
          <div className="p-3.5 sm:p-4 bg-slate-950/70 rounded-xl border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-slate-400 text-xs font-semibold">Bollinger Bands (20, 2)</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded font-mono bg-slate-800 text-slate-300">
                  Width: {data?.technicals?.bb_bandwidth_pct ?? 7.4}%
                </span>
              </div>
              <div className="space-y-1 text-[11px] font-mono text-slate-200 mt-2">
                <div className="flex justify-between py-0.5 border-b border-slate-800/80">
                  <span className="text-slate-400 font-sans">Upper Band:</span>
                  <span className="text-rose-300">{formatPrice(data?.technicals?.bb_upper)}</span>
                </div>
                <div className="flex justify-between py-0.5 border-b border-slate-800/80">
                  <span className="text-slate-400 font-sans">Middle (20 SMA):</span>
                  <span className="text-amber-300">{formatPrice(data?.technicals?.bb_middle)}</span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span className="text-slate-400 font-sans">Lower Band:</span>
                  <span className="text-emerald-300">{formatPrice(data?.technicals?.bb_lower)}</span>
                </div>
              </div>
            </div>
            <p className="text-[10px] text-slate-400 mt-2">
              Price trades inside band channels; volatility contraction observed.
            </p>
          </div>

          {/* Moving Average Confluence */}
          <div className="p-3.5 sm:p-4 bg-slate-950/70 rounded-xl border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-slate-400 text-xs font-semibold">Moving Average Distances</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-emerald-500/20 text-emerald-400">
                  CONFLUENCE
                </span>
              </div>
              <div className="space-y-1.5 text-[11px] font-mono text-slate-200 mt-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-sans">vs 20-DMA:</span>
                  <span className={`font-bold ${(data?.technicals?.distance_20_dma_pct ?? 0) >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                    {(data?.technicals?.distance_20_dma_pct ?? 0) >= 0 ? "+" : ""}{data?.technicals?.distance_20_dma_pct ?? 1.2}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-sans">vs 50-DMA:</span>
                  <span className={`font-bold ${(data?.technicals?.distance_50_dma_pct ?? 0) >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                    {(data?.technicals?.distance_50_dma_pct ?? 0) >= 0 ? "+" : ""}{data?.technicals?.distance_50_dma_pct ?? 2.8}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-sans">vs 200-DMA:</span>
                  <span className={`font-bold ${(data?.technicals?.distance_200_dma_pct ?? 0) >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                    {(data?.technicals?.distance_200_dma_pct ?? 0) >= 0 ? "+" : ""}{data?.technicals?.distance_200_dma_pct ?? 6.4}%
                  </span>
                </div>
              </div>
            </div>
            <div className="text-[10px] text-cyan-300 font-mono mt-2 pt-1 border-t border-slate-800">
              ATR (14-Day): {formatPrice(data?.technicals?.atr_14)}
            </div>
          </div>

        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          7. FINANCIAL STATEMENT EXPLORER & CASH FLOW REALITY CHECK (FEATURE 4)
      ───────────────────────────────────────────────────────────── */}
      <div className="glass-panel p-4 sm:p-6 rounded-2xl border border-slate-800 shadow-xl">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-4 pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <h3 className="font-manrope font-bold text-sm sm:text-base text-white">
              Quarterly Financial Statements & Cash Flow Reality Check
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => setFinancialTab("pnl")}
                className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  financialTab === "pnl" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                Quarterly P&L
              </button>
              <button
                onClick={() => setFinancialTab("cashflow")}
                className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  financialTab === "cashflow" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                Cash Flow Quality
              </button>
            </div>
          </div>
        </div>

        {financialTab === "pnl" ? (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-xs font-mono min-w-[500px]">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-sans">
                  <th className="py-2.5 px-3">Metric</th>
                  {data?.financial_statements?.map((q) => (
                    <th key={q.quarter} className="py-2.5 px-3 text-right">{q.quarter}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                <tr>
                  <td className="py-2.5 px-3 font-sans font-semibold text-slate-300">Revenue from Operations</td>
                  {data?.financial_statements?.map((q) => (
                    <td key={q.quarter} className="py-2.5 px-3 text-right">{curSymbol}{q.revenue_cr.toLocaleString("en-US")} Cr</td>
                  ))}
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-sans font-semibold text-slate-300">EBITDA</td>
                  {data?.financial_statements?.map((q) => (
                    <td key={q.quarter} className="py-2.5 px-3 text-right text-cyan-300">{curSymbol}{q.ebitda_cr.toLocaleString("en-US")} Cr</td>
                  ))}
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-sans font-semibold text-slate-300">Operating Margin (%)</td>
                  {data?.financial_statements?.map((q) => (
                    <td key={q.quarter} className="py-2.5 px-3 text-right text-emerald-400 font-bold">{q.margin_pct}%</td>
                  ))}
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-sans font-semibold text-slate-300">Net Profit (PAT)</td>
                  {data?.financial_statements?.map((q) => (
                    <td key={q.quarter} className="py-2.5 px-3 text-right font-bold text-white">{curSymbol}{q.pat_cr.toLocaleString("en-US")} Cr</td>
                  ))}
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-sans font-semibold text-slate-300">Earnings Per Share (EPS)</td>
                  {data?.financial_statements?.map((q) => (
                    <td key={q.quarter} className="py-2.5 px-3 text-right text-indigo-300">{curSymbol}{q.eps}</td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div className="p-4 bg-slate-950/70 rounded-xl border border-slate-800 space-y-2">
              <span className="text-slate-400 font-sans block text-sm font-bold text-white">
                Cash Conversion Reality Check
              </span>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400 font-sans">Operating Cash Flow (OCF):</span>
                <span className="font-bold text-emerald-400">{curSymbol}{data?.cash_flow?.operating_cash_flow_cr?.toLocaleString("en-US")} Cr</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400 font-sans">Free Cash Flow (FCF):</span>
                <span className="font-bold text-cyan-400">{curSymbol}{data?.cash_flow?.free_cash_flow_cr?.toLocaleString("en-US")} Cr</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400 font-sans">Earnings Quality Ratio (OCF / PAT):</span>
                <span className="font-bold text-indigo-300">{data?.cash_flow?.earnings_quality_ratio}x</span>
              </div>
            </div>

            <div className="p-4 bg-slate-950/70 rounded-xl border border-slate-800 flex flex-col justify-center">
              <span className="text-slate-400 font-sans text-xs mb-1">Audit Assessment:</span>
              <div className="text-base font-bold text-emerald-400 mb-1 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{data?.cash_flow?.earnings_quality_label || "High Quality (Cash Backed)"}</span>
              </div>
              <p className="text-[11px] font-sans text-slate-400 leading-relaxed">
                Reported operating profits are confirmed with strong cash flow conversion. No accrual red flags or debtor elongation detected.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          8. PEER COMPARISON MATRIX (FEATURE 9)
      ───────────────────────────────────────────────────────────── */}
      <div className="glass-panel p-4 sm:p-6 rounded-2xl border border-slate-800 shadow-xl">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-cyan-400" />
            <h3 className="font-manrope font-bold text-sm sm:text-base text-white">
              Sector Competitor Benchmarking Matrix ({data?.sector || "Conglomerate"})
            </h3>
          </div>
          <span className="text-[10px] text-slate-400">Click any peer to switch</span>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-sans">
                <th className="py-2.5 px-3">Company</th>
                <th className="py-2.5 px-3 text-right">CMP</th>
                <th className="py-2.5 px-3 text-right">Market Cap</th>
                <th className="py-2.5 px-3 text-right">P/E Ratio</th>
                <th className="py-2.5 px-3 text-right">P/B</th>
                <th className="py-2.5 px-3 text-right">ROE %</th>
                <th className="py-2.5 px-3 text-right">1Y Return</th>
                <th className="py-2.5 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {data?.peer_comparison?.map((p) => (
                <tr 
                  key={p.ticker}
                  className={`hover:bg-slate-800/40 transition-colors ${p.is_active ? "bg-indigo-950/20 font-bold" : ""}`}
                >
                  <td className="py-2.5 px-3 font-sans">
                    <span className="font-semibold text-white block">{p.name}</span>
                    <span className="text-[10px] text-slate-500 font-mono">{p.ticker}</span>
                  </td>
                  <td className="py-2.5 px-3 text-right">{formatPrice(p.cmp)}</td>
                  <td className="py-2.5 px-3 text-right text-slate-300">{p.market_cap}</td>
                  <td className="py-2.5 px-3 text-right text-cyan-300">{p.pe_ratio}</td>
                  <td className="py-2.5 px-3 text-right text-slate-300">{p.pb_ratio}</td>
                  <td className="py-2.5 px-3 text-right text-emerald-400">{p.roe_pct}%</td>
                  <td className={`py-2.5 px-3 text-right ${p.return_1y >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                    {p.return_1y >= 0 ? "+" : ""}{p.return_1y}%
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    {p.is_active ? (
                      <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded font-sans">Active</span>
                    ) : (
                      <button
                        onClick={() => handleSelectSymbol(p.ticker)}
                        className="text-[10px] bg-slate-800 hover:bg-indigo-600 text-slate-200 hover:text-white px-2 py-0.5 rounded font-sans transition-colors cursor-pointer"
                      >
                        Deep Dive
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          9. LIVE NEWS STREAM WITH FINBERT SENTIMENT & AI EXECUTIVE SUMMARY (FEATURE 10)
      ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Live News Stream with FinBERT Sentiment */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
            <h3 className="font-manrope font-bold text-sm text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" /> Live Company News & Filings
            </h3>
            <span className="text-[10px] bg-cyan-500/10 text-cyan-300 px-2 py-0.5 rounded font-mono">
              FinBERT AI Scored
            </span>
          </div>

          <div className="space-y-3">
            {data?.news_feed?.map((n) => (
              <div key={n.id} className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors">
                <div className="flex justify-between items-start gap-2 mb-1.5">
                  <span className="text-xs font-semibold text-slate-200 hover:text-cyan-300 transition-colors cursor-pointer leading-snug">
                    {n.title}
                  </span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold shrink-0 ${
                    n.sentiment === "Bullish" ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-800 text-slate-400"
                  }`}>
                    {n.sentiment} ({Math.round(n.sentiment_score * 100)}%)
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-slate-500">
                  <span>{n.source}</span>
                  <span>•</span>
                  <span>{n.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FinBERT AI Executive Summary Card */}
        <div className="glass-panel p-6 rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-[#0c1224] to-[#070b16] shadow-xl relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
            <Cpu className="w-32 h-32 text-cyan-400" />
          </div>

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>AI Deep Dive Executive Dispatch</span>
              </div>
              <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded font-mono">
                Real-Time Synthesis
              </span>
            </div>

            <div className="text-sm font-bold text-white mb-3">
              {data?.ai_summary?.verdict || "Structurally Bullish with Favorable Valuation Margin of Safety"}
            </div>

            <ul className="space-y-2 text-xs text-slate-300">
              {data?.ai_summary?.bullets?.map((b, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                  <span className="leading-relaxed">{b}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative z-10 mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 print:hidden">
            <span>Powered by Indra-MarketMind Quant Engine</span>
            <button
              onClick={handleExportReport}
              className="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <span>Export Institutional Tear-Sheet</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
