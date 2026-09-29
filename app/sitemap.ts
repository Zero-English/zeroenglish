import type { MetadataRoute } from "next";
import { getLevelAggregate, getLevelLastModified } from "@/lib/data";
import { getPublishedBlogsByPage } from "@/services/blog.service";
import { SITE_URL } from "@/lib/site-config";
import { isLevelLive, VALID_LEVELS } from "@/lib/level-copy";

const BASE_URL = SITE_URL;
const ITEMS_PER_PAGE = 10;

/**
 * These pages are either hand-written or pulled from a stable set, so there is
 * no real "last updated" date to publish. Omitting `lastmod` is honest; a
 * build-time `new Date()` would claim every page changed on every deploy and
 * would eventually be ignored by crawlers.
 */
const staticRoutes = [
  { url: BASE_URL, changeFrequency: "weekly" as const, priority: 1 },
  { url: `${BASE_URL}/vocabulary`, changeFrequency: "weekly" as const, priority: 0.9 },
  { url: `${BASE_URL}/search`, changeFrequency: "weekly" as const, priority: 0.8 },
  { url: `${BASE_URL}/quiz`, changeFrequency: "weekly" as const, priority: 0.8 },
  { url: `${BASE_URL}/quiz/exam`, changeFrequency: "weekly" as const, priority: 0.7 },
  { url: `${BASE_URL}/quiz/grammar`, changeFrequency: "weekly" as const, priority: 0.7 },
  { url: `${BASE_URL}/quiz/class`, changeFrequency: "weekly" as const, priority: 0.7 },
  { url: `${BASE_URL}/quiz/quick`, changeFrequency: "weekly" as const, priority: 0.7 },
  { url: `${BASE_URL}/about`, changeFrequency: "monthly" as const, priority: 0.7 },
  { url: `${BASE_URL}/news`, changeFrequency: "daily" as const, priority: 0.7 },
  { url: `${BASE_URL}/leaderboard`, changeFrequency: "daily" as const, priority: 0.5 },
  { url: `${BASE_URL}/contact`, changeFrequency: "monthly" as const, priority: 0.5 },
  { url: `${BASE_URL}/privacy`, changeFrequency: "yearly" as const, priority: 0.3 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = staticRoutes.map((r) => ({ ...r }));

  for (const level of VALID_LEVELS) {
    const [aggregate, lastModified] = await Promise.all([
      getLevelAggregate(level),
      getLevelLastModified(level),
    ]);
    // A level that is still being written is `noindex` on the page itself, so
    // listing it here would ask crawlers to index a page that then tells them
    // not to. Levels below the threshold are left out until they are ready.
    if (!isLevelLive(aggregate.total)) continue;

    const totalPages = Math.ceil(aggregate.total / ITEMS_PER_PAGE);
    if (totalPages < 1) continue; // skip empty levels

    // Shared by the hub and every page under it: the whole level changes
    // whenever any word in it is edited, so one date is correct for all.
    const modified = lastModified ? { lastModified } : {};

    entries.push({
      url: `${BASE_URL}/vocabulary/${level.toLowerCase()}`,
      ...modified,
      changeFrequency: "weekly" as const,
      priority: 0.9,
    });

    for (let page = 2; page <= totalPages; page++) {
      entries.push({
        url: `${BASE_URL}/vocabulary/${level.toLowerCase()}/${page}`,
        ...modified,
        changeFrequency: "weekly" as const,
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
