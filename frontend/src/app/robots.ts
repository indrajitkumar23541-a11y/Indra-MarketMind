import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/"],
      },
    ],
    sitemap: "https://indra-marketmind.vercel.app/sitemap.xml",
    host: "https://indra-marketmind.vercel.app",
  };
}
