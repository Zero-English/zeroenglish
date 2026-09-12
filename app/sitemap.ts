import type { MetadataRoute } from "next";
import { getWordsByLevel } from "@/lib/data";
import { getPublishedBlogsByPage } from "@/services/blog.service";

const BASE_URL = "https://zeroenglish.tahmidhasan.net";
const VALID_LEVELS = ["A1", "A2", "B1", "B2"] as const;
const ITEMS_PER_PAGE = 10;

const staticRoutes = [
  { url: BASE_URL, changeFrequency: "weekly" as const, priority: 1 },
  { url: `${BASE_URL}/vocabulary`, changeFrequency: "weekly" as const, priority: 0.9 },
  { url: `${BASE_URL}/search`, changeFrequency: "weekly" as const, priority: 0.8 },
  { url: `${BASE_URL}/quiz`, changeFrequency: "weekly" as const, priority: 0.8 },
  { url: `${BASE_URL}/news`, changeFrequency: "daily" as const, priority: 0.7 },
  { url: `${BASE_URL}/profile`, changeFrequency: "monthly" as const, priority: 0.5 },
  { url: `${BASE_URL}/offline`, changeFrequency: "monthly" as const, priority: 0.3 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const entries: MetadataRoute.Sitemap = staticRoutes.map((r) => ({
    ...r,
    lastModified: now,
  }));

  for (const level of VALID_LEVELS) {
    entries.push({
      url: `${BASE_URL}/vocabulary/${level.toLowerCase()}`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    });

    const words = await getWordsByLevel(level);
    const totalPages = Math.ceil(words.length / ITEMS_PER_PAGE);
    for (let page = 1; page <= totalPages; page++) {
      entries.push({
        url: `${BASE_URL}/vocabulary/${level.toLowerCase()}/${page}`,
        lastModified: now,
        changeFrequency: "daily",
        priority: 0.7,
      });
    }
  }

  const blogs = await getPublishedBlogsByPage(1, 500);
  if (blogs.success && blogs.data) {
    for (const blog of blogs.data) {
      entries.push({
        url: `${BASE_URL}/news/${blog.slug}`,
        lastModified: blog.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.6,
      });
    }
  }

  return entries;
}
