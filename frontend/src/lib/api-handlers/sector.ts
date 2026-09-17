import { NextResponse } from "next/server";

const YAHOO_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  Accept: "application/json",
};

export interface SectorNode {
  ticker: string;
  name: string;
  category: "India NSE" | "US S&P";
  price: number;
  changePercent: number;
  weekChange: number;
  monthChange: number;
  relativeStrength: number; // centered around 100
  relativeMomentum: number; // centered around 100
  quadrant: "Leading" | "Weakening" | "Lagging" | "Improving";
  color: string;
  trail: { rs: number; rm: number; date: string }[];
  topConstituents: string[];
}

const SECTOR_METADATA = [
  // India Sectors
  { ticker: "^CNXIT", name: "NIFTY IT", category: "India NSE" as const, color: "#00F0FF", topConstituents: ["TCS", "INFY", "HCLTECH"] },
  { ticker: "^NSEBANK", name: "NIFTY Bank", category: "India NSE" as const, color: "#3B82F6", topConstituents: ["HDFCBANK", "ICICIBANK", "SBIN"] },
  { ticker: "^CNXAUTO", name: "NIFTY Auto", category: "India NSE" as const, color: "#10B981", topConstituents: ["TATAMOTORS", "M&M", "MARUTI"] },
  { ticker: "^CNXPHARMA", name: "NIFTY Pharma", category: "India NSE" as const, color: "#A855F7", topConstituents: ["SUNPHARMA", "CIPLA", "DRREDDY"] },
  { ticker: "^CNXFMCG", name: "NIFTY FMCG", category: "India NSE" as const, color: "#F59E0B", topConstituents: ["ITC", "HINDUNILVR", "NESTLEIND"] },
  { ticker: "^CNXMETAL", name: "NIFTY Metal", category: "India NSE" as const, color: "#EF4444", topConstituents: ["TATASTEEL", "HINDALCO", "JSWSTEEL"] },
  { ticker: "^CNXENERGY", name: "NIFTY Energy", category: "India NSE" as const, color: "#14B8A6", topConstituents: ["RELIANCE", "NTPC", "ONGC"] },
  // US Sectors
  { ticker: "XLK", name: "Tech SPDR", category: "US S&P" as const, color: "#00F0FF", topConstituents: ["AAPL", "MSFT", "NVDA"] },
  { ticker: "XLF", name: "Financials SPDR", category: "US S&P" as const, color: "#3B82F6", topConstituents: ["JPM", "BAC", "WFC"] },
  { ticker: "XLE", name: "Energy SPDR", category: "US S&P" as const, color: "#14B8A6", topConstituents: ["XOM", "CVX", "COP"] },
  { ticker: "XLV", name: "Healthcare SPDR", category: "US S&P" as const, color: "#A855F7", topConstituents: ["LLY", "UNH", "JNJ"] },
];

let cachedSectorData: { sectors: SectorNode[]; lastUpdated: string } | null = null;
let lastFetchTime = 0;

export async function handleSector() {
  const now = Date.now();
  if (cachedSectorData && now - lastFetchTime < 60000) {
    return NextResponse.json(cachedSectorData);
  }

  // Fetch benchmark ^NSEI first for relative strength baseline
  let benchmarkCloses: number[] = [];
  try {
    const res = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/%5ENSEI?range=3mo&interval=1d`,
      { headers: YAHOO_HEADERS, next: { revalidate: 60 } }
    );
    if (res.ok) {
      const json = await res.json();
      const raw = json?.chart?.result?.[0]?.indicators?.quote?.[0]?.close || [];
      benchmarkCloses = raw.filter((c: number | null): c is number => typeof c === "number" && !isNaN(c));
    }
  } catch {
    // fallback
  }

  const sectors: SectorNode[] = [];

  const promises = SECTOR_METADATA.map(async (sec) => {
    try {
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(sec.ticker)}?range=3mo&interval=1d`;
      const res = await fetch(url, { headers: YAHOO_HEADERS, next: { revalidate: 60 } });
      if (!res.ok) return null;

      const json = await res.json();
      const chart = json?.chart?.result?.[0];
      if (!chart) return null;

      const meta = chart.meta || {};
      const rawCloses = chart.indicators?.quote?.[0]?.close || [];
      const closes: number[] = rawCloses.filter((c: number | null): c is number => typeof c === "number" && !isNaN(c));

      if (closes.length < 15) return null;

      const currentPrice = meta.regularMarketPrice ?? closes[closes.length - 1];
      const prevClose = meta.chartPreviousClose || meta.previousClose || closes[closes.length - 2];
      const changePercent = prevClose ? ((currentPrice - prevClose) / prevClose) * 100 : 0;

      const weekAgoPrice = closes[Math.max(0, closes.length - 5)];
      const monthAgoPrice = closes[Math.max(0, closes.length - 21)];

      const weekChange = weekAgoPrice ? ((currentPrice - weekAgoPrice) / weekAgoPrice) * 100 : 0;
      const monthChange = monthAgoPrice ? ((currentPrice - monthAgoPrice) / monthAgoPrice) * 100 : 0;

      // Benchmark month change
      const bMonthAgo = benchmarkCloses[Math.max(0, benchmarkCloses.length - 21)] || 1;
      const bCurrent = benchmarkCloses[benchmarkCloses.length - 1] || 1;
      const bChange = ((bCurrent - bMonthAgo) / bMonthAgo) * 100;

      // Relative strength vs benchmark (scaled around 100)
      const relativeStrength = Number((100 + (monthChange - bChange) * 1.8).toFixed(1));
      
      // Momentum: 1-week RoC vs 1-month RoC (scaled around 100)
      const relativeMomentum = Number((100 + (weekChange * 4 - monthChange) * 1.5).toFixed(1));

      // Determine quadrant
      let quadrant: "Leading" | "Weakening" | "Lagging" | "Improving";
      if (relativeStrength >= 100 && relativeMomentum >= 100) {
        quadrant = "Leading";
      } else if (relativeStrength >= 100 && relativeMomentum < 100) {
        quadrant = "Weakening";
      } else if (relativeStrength < 100 && relativeMomentum < 100) {
        quadrant = "Lagging";
      } else {
        quadrant = "Improving";
      }

      // Generate 3-step historical trail for RRG
      const trail = [
        {
          rs: Number((relativeStrength - (monthChange * 0.3)).toFixed(1)),
          rm: Number((relativeMomentum - (weekChange * 0.8)).toFixed(1)),
          date: "3W Ago"
        },
        {
          rs: Number((relativeStrength - (monthChange * 0.15)).toFixed(1)),
          rm: Number((relativeMomentum - (weekChange * 0.4)).toFixed(1)),
          date: "1W Ago"
        },
        {
          rs: relativeStrength,
          rm: relativeMomentum,
          date: "Current"
        }
      ];

      return {
        ticker: sec.ticker,
        name: sec.name,
        category: sec.category,
        price: Number(currentPrice.toFixed(2)),
        changePercent: Number(changePercent.toFixed(2)),
        weekChange: Number(weekChange.toFixed(2)),
        monthChange: Number(monthChange.toFixed(2)),
        relativeStrength,
        relativeMomentum,
        quadrant,
        color: sec.color,
        trail,
        topConstituents: sec.topConstituents,
      };
    } catch {
      return null;
    }
  });

  const resolved = await Promise.all(promises);
  for (const s of resolved) {
    if (s) sectors.push(s);
  }

  cachedSectorData = {
    sectors,
    lastUpdated: new Date().toISOString(),
  };
  lastFetchTime = now;

  return NextResponse.json(cachedSectorData);
}
