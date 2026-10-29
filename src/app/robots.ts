import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/docs", "/api", "/offline"],
      },
      {
        userAgent: [
          "PerplexityBot",
          "ChatGPT-User",
          "Claude-Web",
          "OAI-SearchBot",
          "Applebot-Extended",
        ],
        allow: "/",
        disallow: ["/admin", "/docs", "/api", "/offline"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
