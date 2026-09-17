import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Indra-MarketMind | Institutional Financial Terminal",
    short_name: "MarketMind",
    description:
      "Real-time institutional financial intelligence, 5-model NLP sentiment radar, macro forecasting, and dedicated AI Copilot.",
    start_url: "/",
    id: "/",
    display: "standalone",
    background_color: "#05070D",
    theme_color: "#05070D",
    orientation: "any",
    categories: ["finance", "business", "productivity"],
    icons: [
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-maskable-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
    shortcuts: [
      {
        name: "MarketMind Copilot",
        short_name: "Copilot",
        description: "Chat with Real-Time Institutional Market Copilot",
        url: "/copilot",
        icons: [{ src: "/icons/icon-192x192.png", sizes: "192x192" }],
      },
      {
        name: "Live AI News Feed",
        short_name: "Live Feed",
        description: "Stream live breaking market headlines & sentiment",
        url: "/live-feed",
        icons: [{ src: "/icons/icon-192x192.png", sizes: "192x192" }],
      },
      {
        name: "Stock Screener",
        short_name: "Screener",
        description: "Scan multi-factor quantitative breakouts",
        url: "/screener",
        icons: [{ src: "/icons/icon-192x192.png", sizes: "192x192" }],
      },
      {
        name: "AI Forecast",
        short_name: "Forecast",
        description: "Macro scenario and volatility forecasts",
        url: "/forecast",
        icons: [{ src: "/icons/icon-192x192.png", sizes: "192x192" }],
      },
    ],
  };
}
