import { NextResponse } from "next/server";

export interface InsiderTransaction {
  id: string;
  ticker: string;
  company: string;
  exchange: "NSE" | "NASDAQ" | "NYSE";
  insiderName: string;
  position: string;
  type: "BUY" | "SELL" | "OPTION_EXERCISE" | "BLOCK_DEAL";
  shares: number;
  price: number;
  totalValue: number;
  valueFormatted: string;
  date: string;
  filingSource: "SEC Form 4" | "NSE Insider / Bulk" | "BSE Disclosures";
  sentiment: "BULLISH" | "BEARISH" | "NEUTRAL";
  notes: string;
}

export interface WhaleAlert {
  ticker: string;
  insider: string;
  role: string;
  amountFormatted: string;
  type: "ACCUMULATION" | "LIQUIDATION";
  impact: "HIGH" | "CRITICAL";
  date: string;
  rationale: string;
}

const INSIDER_RECORDS: InsiderTransaction[] = [
  {
    id: "ins-01",
    ticker: "NVDA",
    company: "NVIDIA Corporation",
    exchange: "NASDAQ",
    insiderName: "Jensen Huang",
    position: "President & CEO",
    type: "SELL",
    shares: 240000,
    price: 128.5,
    totalValue: 30840000,
    valueFormatted: "$30.84M",
    date: "2026-09-15",
    filingSource: "SEC Form 4",
    sentiment: "NEUTRAL",
    notes: "Pre-scheduled Rule 10b5-1 executive trading plan execution.",
  },
  {
    id: "ins-02",
    ticker: "RELIANCE.NS",
    company: "Reliance Industries Ltd",
    exchange: "NSE",
    insiderName: "Promoter Group (Petroleum Ent)",
    position: "Promoter Entity",
    type: "BUY",
    shares: 450000,
    price: 2985.0,
    totalValue: 1343250000,
    valueFormatted: "₹134.3 Cr",
    date: "2026-09-14",
    filingSource: "NSE Insider / Bulk",
    sentiment: "BULLISH",
    notes: "Open market promoter accumulation ahead of clean energy demerger.",
  },
  {
    id: "ins-03",
    ticker: "MSFT",
    company: "Microsoft Corporation",
    exchange: "NASDAQ",
    insiderName: "Satya Nadella",
    position: "Chairman & CEO",
    type: "OPTION_EXERCISE",
    shares: 110000,
    price: 432.0,
    totalValue: 47520000,
    valueFormatted: "$47.52M",
    date: "2026-09-12",
    filingSource: "SEC Form 4",
    sentiment: "BULLISH",
    notes: "Performance share unit vest retention and direct equity lockup.",
  },
  {
    id: "ins-04",
    ticker: "TATAMOTORS.NS",
    company: "Tata Motors Ltd",
    exchange: "NSE",
    insiderName: "Tata Sons Pvt Ltd",
    position: "Principal Promoter",
    type: "BLOCK_DEAL",
    shares: 1200000,
    price: 980.5,
    totalValue: 1176600000,
    valueFormatted: "₹117.6 Cr",
    date: "2026-09-11",
    filingSource: "NSE Insider / Bulk",
    sentiment: "BULLISH",
    notes: "Institutional bulk acquisition following JLR EV order book expansion.",
  },
  {
    id: "ins-05",
    ticker: "AAPL",
    company: "Apple Inc.",
    exchange: "NASDAQ",
    insiderName: "Arthur D. Levinson",
    position: "Board Director",
    type: "BUY",
    shares: 25000,
    price: 228.4,
    totalValue: 5710000,
    valueFormatted: "$5.71M",
    date: "2026-09-10",
    filingSource: "SEC Form 4",
    sentiment: "BULLISH",
    notes: "Direct discretionary open-market purchase by senior board member.",
  },
  {
    id: "ins-06",
    ticker: "HDFCBANK.NS",
    company: "HDFC Bank Ltd",
    exchange: "NSE",
    insiderName: "Sashidhar Jagdishan",
    position: "Managing Director & CEO",
    type: "BUY",
    shares: 35000,
    price: 1642.0,
    totalValue: 57470000,
    valueFormatted: "₹5.74 Cr",
    date: "2026-09-08",
    filingSource: "NSE Insider / Bulk",
    sentiment: "BULLISH",
    notes: "Open market purchase signalling management conviction in CD-ratio normalisation.",
  },
  {
    id: "ins-07",
    ticker: "TSLA",
    company: "Tesla, Inc.",
    exchange: "NASDAQ",
    insiderName: "Kimbal Musk",
    position: "Director",
    type: "SELL",
    shares: 65000,
    price: 242.1,
    totalValue: 15736500,
    valueFormatted: "$15.73M",
    date: "2026-09-05",
    filingSource: "SEC Form 4",
    sentiment: "BEARISH",
    notes: "Discretionary partial profit booking following robotaxi event rally.",
  },
  {
    id: "ins-08",
    ticker: "INFY.NS",
    company: "Infosys Ltd",
    exchange: "NSE",
    insiderName: "Life Insurance Corp (LIC)",
    position: "Institutional Holder (>5%)",
    type: "BLOCK_DEAL",
    shares: 850000,
    price: 1890.0,
    totalValue: 1606500000,
    valueFormatted: "₹160.6 Cr",
    date: "2026-09-03",
    filingSource: "NSE Insider / Bulk",
    sentiment: "BULLISH",
    notes: "Institutional block addition bolstering sovereign financial backing.",
  },
];

const WHALE_ALERTS: WhaleAlert[] = [
  {
    ticker: "RELIANCE.NS",
    insider: "Promoter Group (Petroleum Ent)",
    role: "Promoter Entity",
    amountFormatted: "₹134.3 Cr ($16.1M)",
    type: "ACCUMULATION",
    impact: "CRITICAL",
    date: "Sep 14, 2026",
    rationale: "Aggressive direct market buying indicating upcoming major corporate catalyst.",
  },
  {
    ticker: "TATAMOTORS.NS",
    insider: "Tata Sons Pvt Ltd",
    role: "Principal Promoter",
    amountFormatted: "₹117.6 Cr ($14.1M)",
    type: "ACCUMULATION",
    impact: "HIGH",
    date: "Sep 11, 2026",
    rationale: "Promoter stake increase confirms long-term conviction in JLR luxury EV cycle.",
  },
  {
    ticker: "NVDA",
    insider: "Jensen Huang",
    role: "President & CEO",
    amountFormatted: "$30.84M",
    type: "LIQUIDATION",
    impact: "HIGH",
    date: "Sep 15, 2026",
    rationale: "Rule 10b5-1 pre-scheduled tranche; does not indicate shift in AI compute fundamentals.",
  },
  {
    ticker: "MSFT",
    insider: "Satya Nadella",
    role: "Chairman & CEO",
    amountFormatted: "$47.52M",
    type: "ACCUMULATION",
    impact: "CRITICAL",
    date: "Sep 12, 2026",
    rationale: "Direct multi-year equity lockup underscores Azure AI infrastructure momentum.",
  },
];

export async function handleInsider() {
  const totalBuys = INSIDER_RECORDS.filter((r) => r.type === "BUY" || r.type === "BLOCK_DEAL");
  const totalSells = INSIDER_RECORDS.filter((r) => r.type === "SELL");

  const buyRatio = Number(((totalBuys.length / INSIDER_RECORDS.length) * 100).toFixed(1));

  return NextResponse.json({
    summary: {
      totalTrackedTransactions: INSIDER_RECORDS.length,
      netSentiment: buyRatio >= 60 ? "STRONG ACCUMULATION" : "NEUTRAL FLOW",
      buyTransactions: totalBuys.length,
      sellTransactions: totalSells.length,
      buyRatioPercent: buyRatio,
      whaleDealsCount: WHALE_ALERTS.length,
      fiiCashFlowToday: "₹+1,284 Cr (Net Buy)",
      diiCashFlowToday: "₹+2,410 Cr (Net Buy)",
    },
    whaleAlerts: WHALE_ALERTS,
    transactions: INSIDER_RECORDS,
    lastUpdated: new Date().toISOString(),
  });
}
