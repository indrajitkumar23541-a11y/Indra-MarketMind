"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";
import { 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  Globe2, 
  RefreshCw, 
  Clock, 
  ArrowUpRight, 
  Radio, 
  CheckCircle2, 
  Moon,
  Compass,
  Search,
  SlidersHorizontal,
  Building2,
  ChevronRight
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

export interface MarketNode {
  id: string;
  name: string;
  city: string;
  country: string;
  region: "Asia-Pacific" | "Europe" | "Americas" | "Middle East & Africa";
  exchange: string;
  symbol: string;
  coordinates: [number, number]; // [lon, lat]
  timezone: string;
  localTradingHours: string;
  localOpenHour: number;
  localOpenMin: number;
  localCloseHour: number;
  localCloseMin: number;
  activeDays?: string[]; // e.g. ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
  currency: string;
}

export const GLOBAL_MARKETS: MarketNode[] = [
  // ─── ASIA-PACIFIC ───
  {
    id: "mumbai",
    name: "National Stock Exchange",
    city: "Mumbai",
    country: "India",
    region: "Asia-Pacific",
    exchange: "NSE",
    symbol: "^NSEI",
    coordinates: [72.8777, 19.0760],
    timezone: "Asia/Kolkata",
    localTradingHours: "09:15 - 15:30 IST",
    localOpenHour: 9,
    localOpenMin: 15,
    localCloseHour: 15,
    localCloseMin: 30,
    currency: "INR",
  },
  {
    id: "tokyo",
    name: "Tokyo Stock Exchange",
    city: "Tokyo",
    country: "Japan",
    region: "Asia-Pacific",
    exchange: "TSE",
    symbol: "^N225",
    coordinates: [139.6917, 35.6895],
    timezone: "Asia/Tokyo",
    localTradingHours: "09:00 - 15:00 JST",
    localOpenHour: 9,
    localOpenMin: 0,
    localCloseHour: 15,
    localCloseMin: 0,
    currency: "JPY",
  },
  {
    id: "hongkong",
    name: "Hong Kong Stock Exchange",
    city: "Hong Kong",
    country: "Hong Kong",
    region: "Asia-Pacific",
    exchange: "HKEX",
    symbol: "^HSI",
    coordinates: [114.1694, 22.3193],
    timezone: "Asia/Hong_Kong",
    localTradingHours: "09:30 - 16:00 HKT",
    localOpenHour: 9,
    localOpenMin: 30,
    localCloseHour: 16,
    localCloseMin: 0,
    currency: "HKD",
  },
  {
    id: "shanghai",
    name: "Shanghai Stock Exchange",
    city: "Shanghai",
    country: "China",
    region: "Asia-Pacific",
    exchange: "SSE",
    symbol: "000001.SS",
    coordinates: [121.4737, 31.2304],
    timezone: "Asia/Shanghai",
    localTradingHours: "09:30 - 15:00 CST",
    localOpenHour: 9,
    localOpenMin: 30,
    localCloseHour: 15,
    localCloseMin: 0,
    currency: "CNY",
  },
  {
    id: "singapore",
    name: "Singapore Exchange",
    city: "Singapore",
    country: "Singapore",
    region: "Asia-Pacific",
    exchange: "SGX",
    symbol: "^STI",
    coordinates: [103.8198, 1.3521],
    timezone: "Asia/Singapore",
    localTradingHours: "09:00 - 17:00 SGT",
    localOpenHour: 9,
    localOpenMin: 0,
    localCloseHour: 17,
    localCloseMin: 0,
    currency: "SGD",
  },
  {
    id: "seoul",
    name: "Korea Exchange",
    city: "Seoul",
    country: "South Korea",
    region: "Asia-Pacific",
    exchange: "KRX",
    symbol: "^KS11",
    coordinates: [126.9780, 37.5665],
    timezone: "Asia/Seoul",
    localTradingHours: "09:00 - 15:30 KST",
    localOpenHour: 9,
    localOpenMin: 0,
    localCloseHour: 15,
    localCloseMin: 30,
    currency: "KRW",
  },
  {
    id: "sydney",
    name: "Australian Securities Exchange",
    city: "Sydney",
    country: "Australia",
    region: "Asia-Pacific",
    exchange: "ASX",
    symbol: "^AXJO",
    coordinates: [151.2093, -33.8688],
    timezone: "Australia/Sydney",
    localTradingHours: "10:00 - 16:00 AEST",
    localOpenHour: 10,
    localOpenMin: 0,
    localCloseHour: 16,
    localCloseMin: 0,
    currency: "AUD",
  },

  // ─── EUROPE ───
  {
    id: "london",
    name: "London Stock Exchange",
    city: "London",
    country: "United Kingdom",
    region: "Europe",
    exchange: "LSE",
    symbol: "^FTSE",
    coordinates: [-0.1276, 51.5072],
    timezone: "Europe/London",
    localTradingHours: "08:00 - 16:30 GMT",
    localOpenHour: 8,
    localOpenMin: 0,
    localCloseHour: 16,
    localCloseMin: 30,
    currency: "GBP",
  },
  {
    id: "frankfurt",
    name: "Frankfurt Stock Exchange",
    city: "Frankfurt",
    country: "Germany",
    region: "Europe",
    exchange: "FWB / XETRA",
    symbol: "^GDAXI",
    coordinates: [8.6821, 50.1109],
    timezone: "Europe/Berlin",
    localTradingHours: "09:00 - 17:30 CET",
    localOpenHour: 9,
    localOpenMin: 0,
    localCloseHour: 17,
    localCloseMin: 30,
    currency: "EUR",
  },
  {
    id: "paris",
    name: "Euronext Paris",
    city: "Paris",
    country: "France",
    region: "Europe",
    exchange: "Euronext",
    symbol: "^FCHI",
    coordinates: [2.3522, 48.8566],
    timezone: "Europe/Paris",
    localTradingHours: "09:00 - 17:30 CET",
    localOpenHour: 9,
    localOpenMin: 0,
    localCloseHour: 17,
    localCloseMin: 30,
    currency: "EUR",
  },
  {
    id: "zurich",
    name: "SIX Swiss Exchange",
    city: "Zurich",
    country: "Switzerland",
    region: "Europe",
    exchange: "SIX",
    symbol: "^SSMI",
    coordinates: [8.5417, 47.3769],
    timezone: "Europe/Zurich",
    localTradingHours: "09:00 - 17:30 CET",
    localOpenHour: 9,
    localOpenMin: 0,
    localCloseHour: 17,
    localCloseMin: 30,
    currency: "CHF",
  },
  {
    id: "amsterdam",
    name: "Euronext Amsterdam",
    city: "Amsterdam",
    country: "Netherlands",
    region: "Europe",
    exchange: "Euronext",
    symbol: "^AEX",
    coordinates: [4.9041, 52.3676],
    timezone: "Europe/Amsterdam",
    localTradingHours: "09:00 - 17:30 CET",
    localOpenHour: 9,
    localOpenMin: 0,
    localCloseHour: 17,
    localCloseMin: 30,
    currency: "EUR",
  },

  // ─── AMERICAS ───
  {
    id: "newyork",
    name: "New York Stock Exchange",
    city: "New York",
    country: "United States",
    region: "Americas",
    exchange: "NYSE / NASDAQ",
    symbol: "^DJI",
    coordinates: [-74.0060, 40.7128],
    timezone: "America/New_York",
    localTradingHours: "09:30 - 16:00 EST",
    localOpenHour: 9,
    localOpenMin: 30,
    localCloseHour: 16,
    localCloseMin: 0,
    currency: "USD",
  },
  {
    id: "toronto",
    name: "Toronto Stock Exchange",
    city: "Toronto",
    country: "Canada",
    region: "Americas",
    exchange: "TSX",
    symbol: "^GSPTSE",
    coordinates: [-79.3832, 43.6532],
    timezone: "America/Toronto",
    localTradingHours: "09:30 - 16:00 EST",
    localOpenHour: 9,
    localOpenMin: 30,
    localCloseHour: 16,
    localCloseMin: 0,
    currency: "CAD",
  },
  {
    id: "saopaulo",
    name: "B3 - Brasil Bolsa Balcão",
    city: "São Paulo",
    country: "Brazil",
    region: "Americas",
    exchange: "B3",
    symbol: "^BVSP",
    coordinates: [-46.6333, -23.5505],
    timezone: "America/Sao_Paulo",
    localTradingHours: "10:00 - 17:00 BRT",
    localOpenHour: 10,
    localOpenMin: 0,
    localCloseHour: 17,
    localCloseMin: 0,
    currency: "BRL",
  },
  {
    id: "mexicocity",
    name: "Bolsa Mexicana de Valores",
    city: "Mexico City",
    country: "Mexico",
    region: "Americas",
    exchange: "BMV",
    symbol: "^MXX",
    coordinates: [-99.1332, 19.4326],
    timezone: "America/Mexico_City",
    localTradingHours: "08:30 - 15:00 CST",
    localOpenHour: 8,
    localOpenMin: 30,
    localCloseHour: 15,
    localCloseMin: 0,
    currency: "MXN",
  },

  // ─── MIDDLE EAST & AFRICA ───
  {
    id: "riyadh",
    name: "Saudi Exchange (Tadawul)",
    city: "Riyadh",
    country: "Saudi Arabia",
    region: "Middle East & Africa",
    exchange: "Tadawul",
    symbol: "^TASI.SR",
    coordinates: [46.6753, 24.7136],
    timezone: "Asia/Riyadh",
    localTradingHours: "10:00 - 15:00 AST (Sun-Thu)",
    localOpenHour: 10,
    localOpenMin: 0,
    localCloseHour: 15,
    localCloseMin: 0,
    activeDays: ["Sun", "Mon", "Tue", "Wed", "Thu"],
    currency: "SAR",
  },
  {
    id: "dubai",
    name: "Dubai Financial Market",
    city: "Dubai",
    country: "UAE",
    region: "Middle East & Africa",
    exchange: "DFM",
    symbol: "DFMGI.AE",
    coordinates: [55.2708, 25.2048],
    timezone: "Asia/Dubai",
    localTradingHours: "10:00 - 15:00 GST",
    localOpenHour: 10,
    localOpenMin: 0,
    localCloseHour: 15,
    localCloseMin: 0,
    currency: "AED",
  },
  {
    id: "johannesburg",
    name: "Johannesburg Stock Exchange",
    city: "Johannesburg",
    country: "South Africa",
    region: "Middle East & Africa",
    exchange: "JSE",
    symbol: "^J203.JO",
    coordinates: [28.0473, -26.2041],
    timezone: "Africa/Johannesburg",
    localTradingHours: "09:00 - 17:00 SAST",
    localOpenHour: 9,
    localOpenMin: 0,
    localCloseHour: 17,
    localCloseMin: 0,
    currency: "ZAR",
  }
];

export function isMarketOpen(market: MarketNode): boolean {
  try {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: market.timezone,
      weekday: 'short',
      hour: 'numeric',
      minute: 'numeric',
      hour12: false
    });
    const parts = formatter.formatToParts(now);
    let weekday = '';
    let hour = 0;
    let minute = 0;
    for (const part of parts) {
      if (part.type === 'weekday') weekday = part.value;
      if (part.type === 'hour') hour = parseInt(part.value, 10);
      if (part.type === 'minute') minute = parseInt(part.value, 10);
    }

    const activeDays = market.activeDays || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
    if (!activeDays.includes(weekday)) return false;

    const currentMinutes = hour * 60 + minute;
    const openMinutes = market.localOpenHour * 60 + market.localOpenMin;
    const closeMinutes = market.localCloseHour * 60 + market.localCloseMin;

    return currentMinutes >= openMinutes && currentMinutes <= closeMinutes;
  } catch (e) {
    return false;
  }
}

export default function GlobalMap() {
  // CRITICAL: Hydration Guard — prevents server vs client SVG and Locale Date string mismatch
  const [mounted, setMounted] = useState(false);
  const [selectedMarketId, setSelectedMarketId] = useState<string>("mumbai");
  const [marketQuotes, setMarketQuotes] = useState<Record<string, any>>({});
  const [loadingQuotes, setLoadingQuotes] = useState<boolean>(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [clockTime, setClockTime] = useState<Date | null>(null);
  const [mapTooltip, setMapTooltip] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    setMounted(true);
    setLastUpdated(new Date());
    setClockTime(new Date());
    const interval = setInterval(() => {
      setClockTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchQuotes = async () => {
    try {
      setLoadingQuotes(true);
      const res = await fetch("/api/data/fetch/market/indices/overview", { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        const map: Record<string, any> = {};
        (json.indices || []).forEach((item: any) => {
          map[item.symbol] = item;
        });
        setMarketQuotes(map);
        setLastUpdated(new Date());
      }
    } catch (err) {
      console.error("Failed to load global market quotes:", err);
    } finally {
      setLoadingQuotes(false);
    }
  };

  useEffect(() => {
    if (mounted) {
      fetchQuotes();
      const interval = setInterval(fetchQuotes, 25000);
      return () => clearInterval(interval);
    }
  }, [mounted]);

  const activeMarket = useMemo(() => {
    return GLOBAL_MARKETS.find((m) => m.id === selectedMarketId) || GLOBAL_MARKETS[0];
  }, [selectedMarketId]);

  const activeQuote = marketQuotes[activeMarket.symbol];

  // Filter markets by region & search
  const filteredMarkets = useMemo(() => {
    return GLOBAL_MARKETS.filter((m) => {
      const matchRegion = selectedRegion === "All" || m.region === selectedRegion;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch = !q || 
        m.city.toLowerCase().includes(q) || 
        m.country.toLowerCase().includes(q) || 
        m.exchange.toLowerCase().includes(q) || 
        m.name.toLowerCase().includes(q);
      return matchRegion && matchSearch;
    });
  }, [selectedRegion, searchQuery]);

  // Real-time market statuses count
  const openCount = useMemo(() => {
    return GLOBAL_MARKETS.filter((m) => isMarketOpen(m)).length;
  }, [clockTime]);

  const closedCount = GLOBAL_MARKETS.length - openCount;

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="glass-panel p-6 sm:p-8 relative overflow-hidden flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-blue-500/5 to-purple-500/10 pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-cyan-500/10 text-cyan-400 rounded-xl border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.15)]">
              <Globe2 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-space font-bold tracking-tight text-white flex items-center gap-3 flex-wrap">
                Global Exchange Radar
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  19 WORLD EXCHANGES
                </span>
              </h1>
              <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
                Real-time operational status, live index valuations, and official trading session hours worldwide
              </p>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-3 self-stretch sm:self-auto justify-between sm:justify-end">
          <div className="text-right hidden sm:block">
            <div className="text-[10px] text-slate-500 font-mono">LIVE FEED SYNC</div>
            <div suppressHydrationWarning className="text-xs font-mono text-slate-300">
              {mounted && lastUpdated ? (
                lastUpdated.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })
              ) : (
                "--:--:--"
              )}
            </div>
          </div>
          <button
            onClick={() => fetchQuotes()}
            disabled={loadingQuotes}
            className="px-3.5 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-semibold flex items-center gap-2 transition active:scale-95 disabled:opacity-50 cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.1)]"
          >
            <RefreshCw className={cn("w-3.5 h-3.5", loadingQuotes && "animate-spin")} />
            <span>Refresh Feeds</span>
          </button>
        </div>
      </div>

      {/* Global Health Metric Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-panel p-4 flex items-center gap-3 border border-white/5">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase text-slate-400">Global Hubs</div>
            <div className="text-lg font-bold font-space text-white">19 Stock Exchanges</div>
          </div>
        </div>

        <div className="glass-panel p-4 flex items-center gap-3 border border-emerald-500/20 bg-emerald-950/10">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase text-slate-400">Sessions Open Now</div>
            <div suppressHydrationWarning className="text-lg font-bold font-mono text-emerald-400 flex items-center gap-1.5">
              {mounted ? openCount : "--"} Active Markets
            </div>
          </div>
        </div>

        <div className="glass-panel p-4 flex items-center gap-3 border border-white/5">
          <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400">
            <Moon className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase text-slate-400">Sessions Closed</div>
            <div suppressHydrationWarning className="text-lg font-bold font-mono text-slate-300">
              {mounted ? closedCount : "--"} Markets Off-Hours
            </div>
          </div>
        </div>

        <div className="glass-panel p-4 flex items-center gap-3 border border-purple-500/20 bg-purple-950/10">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase text-slate-400">Data Stream</div>
            <div className="text-lg font-bold font-mono text-purple-300">Direct Yahoo Feed</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Interactive Map + Deep Dive Card */}
        <div className="lg:col-span-8 space-y-6">
          <div className="glass-panel p-6 relative overflow-hidden">
            {/* Cyber Grid Background */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
            
            {/* Map Status Header */}
            <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4 pb-3 border-b border-white/5 text-xs">
              <div className="flex items-center gap-2 text-slate-400">
                <Compass className="w-4 h-4 text-cyan-400" />
                <span className="font-mono uppercase tracking-wider text-[11px]">Mercator Projection • 19 Global Hubs</span>
              </div>
              <div className="flex items-center gap-4 text-[11px] font-mono">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#10B981] animate-ping" />
                  Trading Session Open
                </span>
                <span className="flex items-center gap-1.5 text-slate-400">
                  <span className="w-2 h-2 rounded-full bg-slate-600" />
                  Trading Session Closed
                </span>
              </div>
            </div>

            {/* Map Area — Hydration mismatch safely avoided */}
            <div className="w-full h-110 sm:h-135 relative z-10 flex items-center justify-center rounded-xl bg-[#070A12]/80 border border-white/5 overflow-hidden">
              {!mounted ? (
                <div className="flex flex-col items-center justify-center gap-4 p-8 text-center">
                  <div className="relative flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full border-2 border-cyan-500/20 border-t-cyan-400 animate-spin" />
                    <Globe2 className="w-7 h-7 text-cyan-400 absolute animate-pulse" />
                  </div>
                  <div>
                    <div className="text-xs font-mono font-bold tracking-widest text-cyan-400 uppercase">
                      Initializing Global Projection
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">
                      Calibrating 19 exchange coordinates & live sessions...
                    </div>
                  </div>
                </div>
              ) : (
                <ComposableMap 
                  projection="geoMercator" 
                  projectionConfig={{ scale: 128, center: [15, 20] }}
                  className="w-full h-full"
                >
                  <Geographies geography={geoUrl}>
                    {({ geographies }) =>
                      geographies.map((geo) => (
                        <Geography 
                          key={geo.rsmKey} 
                          geography={geo} 
                          fill="#0D1322" 
                          stroke="#1E293B"
                          strokeWidth={0.6}
                          style={{
                            default: { outline: "none" },
                            hover: { fill: "#152038", outline: "none", transition: "all 250ms" },
                            pressed: { fill: "#1E293B", outline: "none" },
                          }}
                        />
                      ))
                    }
                  </Geographies>
                  
                  {GLOBAL_MARKETS.map((market) => {
                    const isOpen = isMarketOpen(market);
                    const quote = marketQuotes[market.symbol];
                    const isSelected = selectedMarketId === market.id;
                    const changePercent = quote?.dp ?? 0;
                    const isPositive = changePercent >= 0;

                    const markerColor = isOpen 
                      ? (isPositive ? "#10B981" : "#EF4444") 
                      : "#64748B";

                    return (
                      <Marker 
                        key={market.id} 
                        coordinates={market.coordinates}
                        onClick={() => setSelectedMarketId(market.id)}
                        onMouseEnter={() => setMapTooltip(`${market.city} (${market.exchange}) • ${isOpen ? "OPEN" : "CLOSED"}`)}
                        onMouseLeave={() => setMapTooltip(null)}
                        className="cursor-pointer transition duration-200"
                      >
                        <g transform="translate(-14, -28)">
                          {/* Pulsing beacon if market is open */}
                          {isOpen && (
                            <motion.circle 
                              cx="14" cy="14" r="14" 
                              fill={markerColor}
                              initial={{ scale: 0.8, opacity: 0.7 }}
                              animate={{ scale: [0.8, 1.9, 0.8], opacity: [0.7, 0, 0.7] }}
                              transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                            />
                          )}

                          {/* Selected Reticle */}
                          {isSelected && (
                            <circle 
                              cx="14" cy="14" r="16" 
                              fill="none" 
                              stroke="#06B6D4" 
                              strokeWidth="2" 
                              strokeDasharray="4 2"
                              className="animate-spin"
                              style={{ animationDuration: "8s" }}
                            />
                          )}

                          {/* Main node pin */}
                          <circle 
                            cx="14" cy="14" r="6" 
                            fill={markerColor}
                            stroke="#0F172A"
                            strokeWidth="2"
                            className="shadow-lg"
                          />
                          <circle 
                            cx="14" cy="14" r="2.5" 
                            fill="#FFFFFF" 
                          />

                          {/* Label tag */}
                          <rect 
                            x="-12" y="26" width="52" height="14" rx="3" 
                            fill={isSelected ? "#06B6D4" : "#0A0E1A"} 
                            stroke={isSelected ? "#22D3EE" : "#334155"} 
                            strokeWidth="1"
                            opacity="0.95"
                          />
                          <text 
                            textAnchor="middle" 
                            x="14" y="36.5" 
                            fill={isSelected ? "#000000" : "#F8FAFC"} 
                            fontSize="8px" 
                            fontWeight="bold" 
                            fontFamily="monospace"
                          >
                            {market.city.toUpperCase()}
                          </text>
                        </g>
                      </Marker>
                    );
                  })}
                </ComposableMap>
              )}

              {/* Tooltip Overlay */}
              {mapTooltip && (
                <div className="absolute top-4 left-4 z-20 px-3 py-1.5 rounded-lg bg-[#0F172A]/90 backdrop-blur-md border border-cyan-500/30 text-xs text-white font-mono shadow-xl animate-in fade-in duration-150">
                  {mapTooltip}
                </div>
              )}
            </div>
          </div>

          {/* Active Hub Deep-Dive Card */}
          <div className="glass-panel p-6 relative overflow-hidden border border-cyan-500/20">
            <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-white/5">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                    {activeMarket.exchange}
                  </span>
                  <span className="text-slate-400 text-xs">•</span>
                  <span className="text-slate-300 text-xs font-medium">{activeMarket.country}</span>
                  <span className="text-slate-400 text-xs">•</span>
                  <span className="text-slate-400 text-xs">{activeMarket.region}</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-space font-bold text-white mt-1">
                  {activeMarket.name} ({activeMarket.city})
                </h2>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                {isMarketOpen(activeMarket) ? (
                  <div suppressHydrationWarning className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-xs font-bold font-mono">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    SESSION OPEN
                  </div>
                ) : (
                  <div suppressHydrationWarning className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800/80 text-slate-400 border border-slate-700 text-xs font-bold font-mono">
                    <Moon className="w-3.5 h-3.5 text-slate-400" />
                    SESSION CLOSED
                  </div>
                )}

                <Link
                  href={`/deep-dive?ticker=${encodeURIComponent(activeMarket.symbol)}`}
                  className="px-3.5 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  Analyze <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5">
              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5">
                <div className="text-[10px] uppercase font-mono text-slate-400">Benchmark Index</div>
                <div className="text-sm sm:text-base font-bold text-white mt-0.5 truncate">
                  {activeQuote?.name || activeMarket.symbol}
                </div>
                <div className="text-[11px] font-mono text-slate-500">{activeMarket.symbol}</div>
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5">
                <div className="text-[10px] uppercase font-mono text-slate-400">Live Valuation</div>
                <div className="text-base sm:text-lg font-bold font-mono text-white mt-0.5">
                  {activeQuote?.c ? (
                    activeMarket.country === "India" 
                      ? `₹${activeQuote.c.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`
                      : activeQuote.c.toLocaleString("en-US", { maximumFractionDigits: 2 })
                  ) : "Syncing..."}
                </div>
                <div className={cn(
                  "text-xs font-bold font-mono flex items-center gap-1 mt-0.5",
                  (activeQuote?.dp ?? 0) >= 0 ? "text-emerald-400" : "text-rose-400"
                )}>
                  {(activeQuote?.dp ?? 0) >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {(activeQuote?.dp ?? 0) >= 0 ? "+" : ""}{(activeQuote?.dp ?? 0).toFixed(2)}%
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5">
                <div className="text-[10px] uppercase font-mono text-slate-400">Day's Range</div>
                <div className="text-xs sm:text-sm font-mono text-slate-200 mt-1">
                  H: <span className="text-emerald-400">{activeQuote?.h ? activeQuote.h.toLocaleString() : "-"}</span>
                </div>
                <div className="text-xs sm:text-sm font-mono text-slate-200">
                  L: <span className="text-rose-400">{activeQuote?.l ? activeQuote.l.toLocaleString() : "-"}</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5">
                <div className="text-[10px] uppercase font-mono text-slate-400">Official Trading Hours</div>
                <div className="text-xs font-mono text-cyan-300 font-semibold mt-1 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-cyan-400" />
                  {activeMarket.localTradingHours}
                </div>
                <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                  Local Timezone: {activeMarket.timezone}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Global Nodes with Region Filter & Search */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-panel p-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-3">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
                <h3 className="font-space font-bold text-sm text-white">Global Nodes</h3>
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                {filteredMarkets.length} OF {GLOBAL_MARKETS.length} EXCHANGES
              </span>
            </div>

            {/* Region Filter Buttons */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 custom-scrollbar text-[11px] font-mono mb-3">
              {["All", "Asia-Pacific", "Europe", "Americas", "Middle East & Africa"].map((reg) => (
                <button
                  key={reg}
                  onClick={() => setSelectedRegion(reg)}
                  className={cn(
                    "px-2.5 py-1 rounded-lg transition whitespace-nowrap cursor-pointer",
                    selectedRegion === reg
                      ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold"
                      : "bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 border border-white/5"
                  )}
                >
                  {reg === "Middle East & Africa" ? "MEA" : reg}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative mb-3">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search city, exchange, or country..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
              />
            </div>
            
            {/* Scrollable List of Markets */}
            <div className="space-y-2.5 max-h-135 overflow-y-auto custom-scrollbar pr-1">
              {filteredMarkets.map((market) => {
                const isOpen = isMarketOpen(market);
                const quote = marketQuotes[market.symbol];
                const isSelected = selectedMarketId === market.id;
                const change = quote?.dp ?? 0;
                const isUp = change >= 0;

                return (
                  <div 
                    key={market.id} 
                    onClick={() => setSelectedMarketId(market.id)}
                    className={cn(
                      "p-3 rounded-xl border transition cursor-pointer flex flex-col gap-1.5 group",
                      isSelected 
                        ? "bg-cyan-950/30 border-cyan-500/40 shadow-[0_0_20px_rgba(6,182,212,0.12)]" 
                        : "bg-white/[0.02] border-white/5 hover:bg-white/[0.05] hover:border-white/10"
                    )}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white group-hover:text-cyan-300 transition">
                            {market.city}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/5 text-slate-400 font-mono">
                            {market.exchange}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400">{market.country}</div>
                      </div>

                      <span suppressHydrationWarning className={cn(
                        "text-[9px] px-2 py-0.5 rounded-full font-bold uppercase font-mono tracking-wider",
                        isOpen 
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" 
                          : "bg-slate-800 text-slate-400 border border-slate-700"
                      )}>
                        {isOpen ? "Open" : "Closed"}
                      </span>
                    </div>

                    {/* Official Hours Tag */}
                    <div className="flex items-center gap-1 text-[10px] font-mono text-slate-400 bg-black/20 px-2 py-1 rounded">
                      <Clock className="w-2.5 h-2.5 text-cyan-400" />
                      <span>{market.localTradingHours}</span>
                    </div>

                    {/* Price and Day Change */}
                    <div className="flex justify-between items-center pt-1.5 border-t border-white/5 text-xs font-mono">
                      <span className="text-slate-300 font-semibold">
                        {quote?.c ? (
                          market.country === "India" 
                            ? `₹${quote.c.toLocaleString("en-IN", { maximumFractionDigits: 1 })}` 
                            : quote.c.toLocaleString("en-US", { maximumFractionDigits: 1 })
                        ) : "Syncing..."}
                      </span>
                      <span className={cn(
                        "font-bold flex items-center gap-1",
                        isUp ? "text-emerald-400" : "text-rose-400"
                      )}>
                        {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {isUp ? "+" : ""}{change.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick World Financial Clocks */}
          <div className="glass-panel p-5">
            <h4 className="font-space font-bold text-xs uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              Major Financial Center Clocks
            </h4>
            <div className="space-y-2 text-xs font-mono">
              {[
                { city: "Mumbai (IST)", tz: "Asia/Kolkata" },
                { city: "Tokyo (JST)", tz: "Asia/Tokyo" },
                { city: "London (BST/GMT)", tz: "Europe/London" },
                { city: "New York (EST/EDT)", tz: "America/New_York" },
                { city: "Sydney (AEST)", tz: "Australia/Sydney" }
              ].map((c) => {
                const timeStr = mounted && clockTime
                  ? new Intl.DateTimeFormat('en-US', { timeZone: c.tz, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).format(clockTime) 
                  : "--:--:--";
                return (
                  <div key={c.city} className="flex justify-between items-center py-1.5 border-b border-white/5 last:border-0">
                    <span className="text-slate-400">{c.city}</span>
                    <span suppressHydrationWarning className="text-white font-bold">{timeStr}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
