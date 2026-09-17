import { NextResponse } from "next/server";

const YAHOO_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  Accept: "application/json",
};

export interface ScreenerItem {
  ticker: string;
  name: string;
  exchange: "NSE" | "NASDAQ" | "NYSE";
  sector: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  avgVolume: number;
  volumeSurge: number; // multiplier e.g. 1.8x
  rsi14: number;
  sma50: number;
  sma200: number;
  distSma50: number; // % distance
  high52: number;
  low52: number;
  dist52wHigh: number; // % below 52w high
  peRatio: number;
  marketCap: string;
  signals: string[];
}

const SCREENER_UNIVERSE = [
  // India Top Tier
  { ticker: "RELIANCE.NS", name: "Reliance Industries", exchange: "NSE" as const, sector: "Energy / Telecom", peRatio: 26.4, mcap: "₹19.8T" },
  { ticker: "TCS.NS", name: "Tata Consultancy Services", exchange: "NSE" as const, sector: "Technology", peRatio: 28.2, mcap: "₹14.2T" },
  { ticker: "HDFCBANK.NS", name: "HDFC Bank", exchange: "NSE" as const, sector: "Financial Services", peRatio: 18.5, mcap: "₹12.6T" },
  { ticker: "INFY.NS", name: "Infosys", exchange: "NSE" as const, sector: "Technology", peRatio: 25.1, mcap: "₹7.4T" },
  { ticker: "ICICIBANK.NS", name: "ICICI Bank", exchange: "NSE" as const, sector: "Financial Services", peRatio: 17.9, mcap: "₹8.8T" },
  { ticker: "TATAMOTORS.NS", name: "Tata Motors", exchange: "NSE" as const, sector: "Automobile", peRatio: 9.8, mcap: "₹3.5T" },
  { ticker: "BHARTIARTL.NS", name: "Bharti Airtel", exchange: "NSE" as const, sector: "Telecom", peRatio: 42.1, mcap: "₹9.2T" },
  { ticker: "SBIN.NS", name: "State Bank of India", exchange: "NSE" as const, sector: "Financial Services", peRatio: 10.4, mcap: "₹7.1T" },
  { ticker: "SUNPHARMA.NS", name: "Sun Pharmaceutical", exchange: "NSE" as const, sector: "Healthcare", peRatio: 36.8, mcap: "₹4.1T" },
  { ticker: "ITC.NS", name: "ITC Ltd", exchange: "NSE" as const, sector: "FMCG", peRatio: 27.5, mcap: "₹6.1T" },
  { ticker: "TITAN.NS", name: "Titan Company", exchange: "NSE" as const, sector: "Consumer Goods", peRatio: 78.4, mcap: "₹3.1T" },
  { ticker: "LICI.NS", name: "Life Insurance Corp", exchange: "NSE" as const, sector: "Insurance", peRatio: 14.2, mcap: "₹6.2T" },
  // US Tech Giants
  { ticker: "NVDA", name: "NVIDIA Corporation", exchange: "NASDAQ" as const, sector: "Semiconductors", peRatio: 48.6, mcap: "$3.2T" },
  { ticker: "AAPL", name: "Apple Inc.", exchange: "NASDAQ" as const, sector: "Consumer Electronics", peRatio: 33.2, mcap: "$3.4T" },
  { ticker: "MSFT", name: "Microsoft Corporation", exchange: "NASDAQ" as const, sector: "Cloud / Software", peRatio: 34.8, mcap: "$3.1T" },
  { ticker: "AMZN", name: "Amazon.com Inc.", exchange: "NASDAQ" as const, sector: "E-Commerce / Cloud", peRatio: 41.5, mcap: "$2.0T" },
  { ticker: "TSLA", name: "Tesla Inc.", exchange: "NASDAQ" as const, sector: "Automotive / AI", peRatio: 65.0, mcap: "$780B" },
  { ticker: "META", name: "Meta Platforms", exchange: "NASDAQ" as const, sector: "Social / AI", peRatio: 26.2, mcap: "$1.4T" },
  { ticker: "GOOGL", name: "Alphabet Inc.", exchange: "NASDAQ" as const, sector: "Search / Cloud", peRatio: 23.4, mcap: "$2.1T" },
  { ticker: "AMD", name: "Advanced Micro Devices", exchange: "NASDAQ" as const, sector: "Semiconductors", peRatio: 44.0, mcap: "$240B" },
];

function calculateRSI(closes: number[], period: number = 14): number {
  if (closes.length <= period) return 50;
  let gains = 0;
  let losses = 0;

  for (let i = 1; i <= period; i++) {
    const diff = closes[i] - closes[i - 1];
    if (diff >= 0) gains += diff;
    else losses -= diff;
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;

  for (let i = period + 1; i < closes.length; i++) {
    const diff = closes[i] - closes[i - 1];
    if (diff >= 0) {
      avgGain = (avgGain * (period - 1) + diff) / period;
      avgLoss = (avgLoss * (period - 1)) / period;
    } else {
      avgGain = (avgGain * (period - 1)) / period;
      avgLoss = (avgLoss * (period - 1) - diff) / period;
    }
  }

  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return Number((100 - 100 / (1 + rs)).toFixed(1));
}

function calculateSMA(data: number[], window: number): number {
  if (data.length < window) return data[data.length - 1] || 0;
  const slice = data.slice(-window);
  const sum = slice.reduce((a, b) => a + b, 0);
  return Number((sum / slice.length).toFixed(2));
}

// In-memory cache for speed
let cacheTime = 0;
let cachedResult: { data: ScreenerItem[]; lastUpdated: string } | null = null;

export async function handleScreener() {
  const now = Date.now();
  if (cachedResult && now - cacheTime < 45000) {
    return NextResponse.json(cachedResult);
  }

  const results: ScreenerItem[] = [];

  const promises = SCREENER_UNIVERSE.map(async (item) => {
    try {
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(item.ticker)}?range=1y&interval=1d`;
      const res = await fetch(url, { headers: YAHOO_HEADERS, next: { revalidate: 30 } });
      if (!res.ok) return null;

      const json = await res.json();
      const chart = json?.chart?.result?.[0];
      if (!chart) return null;

      const meta = chart.meta || {};
      const quote = chart.indicators?.quote?.[0] || {};
      const rawCloses: (number | null)[] = quote.close || [];
      const rawVolumes: (number | null)[] = quote.volume || [];
      const rawHighs: (number | null)[] = quote.high || [];
      const rawLows: (number | null)[] = quote.low || [];

      const closes = rawCloses.filter((c): c is number => typeof c === "number" && !isNaN(c));
      const volumes = rawVolumes.filter((v): v is number => typeof v === "number" && !isNaN(v));
      const highs = rawHighs.filter((h): h is number => typeof h === "number" && !isNaN(h));
      const lows = rawLows.filter((l): l is number => typeof l === "number" && !isNaN(l));

      if (closes.length < 20) return null;

      const currentPrice = meta.regularMarketPrice ?? closes[closes.length - 1];
      const prevClose = meta.chartPreviousClose || meta.previousClose || closes[closes.length - 2];
      const change = currentPrice - prevClose;
      const changePercent = prevClose ? (change / prevClose) * 100 : 0;

      const high52 = meta.fiftyTwoWeekHigh || (highs.length ? Math.max(...highs) : currentPrice);
      const low52 = meta.fiftyTwoWeekLow || (lows.length ? Math.min(...lows) : currentPrice);
      const dist52wHigh = high52 ? ((high52 - currentPrice) / high52) * 100 : 0;

      const rsi14 = calculateRSI(closes, 14);
      const sma50 = calculateSMA(closes, Math.min(50, closes.length));
      const sma200 = calculateSMA(closes, Math.min(200, closes.length));
      const distSma50 = sma50 ? ((currentPrice - sma50) / sma50) * 100 : 0;

      const currentVolume = meta.regularMarketVolume || volumes[volumes.length - 1] || 0;
      const recentVolumes = volumes.slice(-20);
      const avgVolume = recentVolumes.length
        ? recentVolumes.reduce((a, b) => a + b, 0) / recentVolumes.length
        : currentVolume;
      const volumeSurge = avgVolume > 0 ? Number((currentVolume / avgVolume).toFixed(2)) : 1.0;

      // Signals
      const signals: string[] = [];
      if (rsi14 < 32) signals.push("Oversold (RSI < 32)");
      if (rsi14 > 68) signals.push("Overbought (RSI > 68)");
      if (dist52wHigh <= 3.5) signals.push("Near 52W High");
      if (currentPrice > sma50 && distSma50 > 0 && distSma50 < 4.0) signals.push("Testing 50-EMA Support");
      if (sma50 > sma200 && closes.length >= 100) signals.push("Golden Trend (50 > 200)");
      if (volumeSurge >= 1.5) signals.push(`Volume Spike (${volumeSurge}x)`);
      if (changePercent >= 2.5) signals.push("Strong Intraday Momentum");
      if (signals.length === 0) signals.push("Consolidating");

      return {
        ticker: item.ticker,
        name: meta.shortName || item.name,
        exchange: item.exchange,
        sector: item.sector,
        price: Number(currentPrice.toFixed(2)),
        change: Number(change.toFixed(2)),
        changePercent: Number(changePercent.toFixed(2)),
        volume: currentVolume,
        avgVolume: Math.round(avgVolume),
        volumeSurge,
        rsi14,
        sma50,
        sma200,
        distSma50: Number(distSma50.toFixed(2)),
        high52: Number(high52.toFixed(2)),
        low52: Number(low52.toFixed(2)),
        dist52wHigh: Number(dist52wHigh.toFixed(2)),
        peRatio: item.peRatio,
        marketCap: item.mcap,
        signals,
      };
    } catch {
      return null;
    }
  });

  const resolved = await Promise.all(promises);
  for (const item of resolved) {
    if (item) results.push(item);
  }

  // Sort by changePercent descending
  results.sort((a, b) => b.changePercent - a.changePercent);

  cachedResult = {
    data: results,
    lastUpdated: new Date().toISOString(),
  };
  cacheTime = now;

  return NextResponse.json(cachedResult);
}
