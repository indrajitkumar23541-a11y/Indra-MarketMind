import type { Metadata, Viewport } from "next";
import { Inter, Manrope, Space_Grotesk } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import TopNav from "@/components/TopNav";
import MobileBottomNav from "@/components/MobileBottomNav";
import MarketMindCopilot from "@/components/MarketMindCopilot";
import { NavProvider } from "@/lib/NavContext";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space" });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#05070D",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://indra-marketmind.vercel.app"),
  title: {
    default: "Indra-MarketMind | Institutional AI Market Intelligence & Trading Terminal",
    template: "%s | Indra-MarketMind",
  },
  description:
    "Indra-MarketMind is an institutional-grade AI financial terminal created by Indrajit Kumar. Featuring real-time sentiment analysis with 5 NLP models, hybrid Prophet + LSTM forecasting, 7-factor Fear & Greed index, and live 19-hub global exchange radar.",
  applicationName: "Indra-MarketMind",
  authors: [
    {
      name: "Indrajit Kumar",
      url: "https://github.com/indrajitkumar23541-a11y/Indra-MarketMind",
    },
  ],
  creator: "Indrajit Kumar",
  publisher: "Indrajit Kumar",
  keywords: [
    "Indra-MarketMind",
    "Indra MarketMind",
    "Indra Market Mind",
    "indrajitkumar23541",
    "Indrajit Kumar",
    "AI Financial Terminal",
    "Market Intelligence Terminal",
    "Stock Market Sentiment Analysis",
    "FinBERT Financial NLP",
    "Hybrid Machine Learning Stock Forecast",
    "NIFTY 50 Live Analytics",
    "S&P 500 Sentiment",
    "Fear and Greed Index",
    "Algorithmic Trading",
    "AI Quant Lab",
    "Stock Screener",
    "Global Financial Exchanges Radar",
    "Quantitative Finance",
  ],
  alternates: {
    canonical: "https://indra-marketmind.vercel.app",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://indra-marketmind.vercel.app",
    title: "Indra-MarketMind | Institutional AI Market Intelligence & Trading Terminal",
    description:
      "AI-powered financial intelligence terminal decoding real-time market sentiment, institutional fear & greed, hybrid deep learning forecasts, and live trading radar.",
    siteName: "Indra-MarketMind",
    images: [
      {
        url: "/banner.png",
        width: 1200,
        height: 630,
        alt: "Indra-MarketMind Live Terminal Banner",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Indra-MarketMind | AI Financial Intelligence & Trading Terminal",
    description:
      "Institutional AI market intelligence terminal decoding sentiment with 5 NLP models, Monte Carlo fan cones, and 19 global exchanges.",
    images: ["/banner.png"],
    creator: "@indrajitkumar",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "I3W6dmeLScyhngNv9VskrtrJlR2NnLngOXJGHySNtFo",
  },
  category: "finance",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Indra-MarketMind",
  alternateName: ["Indra MarketMind", "Indra Market Mind", "MarketMind"],
  url: "https://indra-marketmind.vercel.app",
  applicationCategory: "FinanceApplication",
  operatingSystem: "Web",
  description:
    "Institutional-grade AI financial terminal created by Indrajit Kumar. Features real-time NLP sentiment analysis, hybrid ML price forecasting, and 7-factor institutional Fear & Greed index.",
  author: {
    "@type": "Person",
    name: "Indrajit Kumar",
    url: "https://github.com/indrajitkumar23541-a11y",
  },
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  featureList: [
    "5-Model NLP Sentiment Ensemble (FinBERT, RoBERTa, FinGPT, VADER, TextBlob)",
    "Hybrid Prophet + Bi-LSTM Price Forecasting with Monte Carlo Fan Cones",
    "7-Factor Institutional Fear & Greed Index for S&P 500 & NIFTY 50",
    "19 Worldwide Financial Exchanges Radar with Real-Time Session Status",
    "Institutional Stock Deep Dive with DCF Valuation, Piotroski F-Score & Altman-Z",
    "AI Quant Lab Pro for Vectorized Backtesting & Model Arena",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta
          name="google-site-verification"
          content="I3W6dmeLScyhngNv9VskrtrJlR2NnLngOXJGHySNtFo"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${inter.variable} ${manrope.variable} ${spaceGrotesk.variable} font-sans bg-[#05070D] text-slate-200 antialiased h-screen overflow-hidden flex flex-col lg:flex-row`}
      >
        <NavProvider>
          <Sidebar />
          <div className="flex-1 flex flex-col min-w-0 h-full relative">
            <TopNav />
            <main className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-4 md:p-6 pb-24 lg:pb-6 custom-scrollbar bg-radial-[at_100%_0%] from-indigo-900/10 via-[#05070D] to-[#030407]">
              {children}
            </main>
          </div>
          <MarketMindCopilot />
          <MobileBottomNav />
        </NavProvider>
      </body>
    </html>
  );
}

