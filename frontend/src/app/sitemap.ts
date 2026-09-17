import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://indra-marketmind.vercel.app";

  const routes = [
    { path: "", priority: 1.0, changeFrequency: "always" as const },
    { path: "/live-feed", priority: 0.9, changeFrequency: "always" as const },
    { path: "/fear-greed", priority: 0.9, changeFrequency: "hourly" as const },
    { path: "/forecast", priority: 0.9, changeFrequency: "hourly" as const },
    { path: "/deep-dive", priority: 0.8, changeFrequency: "daily" as const },
    { path: "/global-map", priority: 0.8, changeFrequency: "daily" as const },
    { path: "/research", priority: 0.8, changeFrequency: "daily" as const },
    { path: "/screener", priority: 0.7, changeFrequency: "daily" as const },
    { path: "/sector", priority: 0.7, changeFrequency: "daily" as const },
    { path: "/insider", priority: 0.7, changeFrequency: "daily" as const },
    { path: "/watchlist", priority: 0.6, changeFrequency: "weekly" as const },
    { path: "/alerts", priority: 0.6, changeFrequency: "weekly" as const },
  ];

  const now = new Date();

  return routes.map((item) => ({
    url: `${baseUrl}${item.path}`,
    lastModified: now,
    changeFrequency: item.changeFrequency,
    priority: item.priority,
  }));
}
