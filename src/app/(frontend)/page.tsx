import type { Metadata } from "next";
import { getLevelStats } from "@/lib/data";
import { HomeOrDashboard } from "@/components/home-or-dashboard";
import { getPublishedBlogsByPage } from "@/services/blog.service";
import { getLeaderboard } from "@/services/user.service";
import { SITE_URL, SITE_OG_IMAGE } from "@/lib/site-config";

export const revalidate = 3600;

const HOME_TITLE = "Learn English Vocabulary in Bangla | Zero English";

const HOME_DESCRIPTION =
  "Learn English vocabulary with Bangla meanings. Browse 5,000+ CEFR-graded words from A1 to C1, each with example sentences, synonyms and antonyms, then test yourself with quizzes. Free.";

export const metadata: Metadata = {
  // `absolute` because the frontend layout appends the brand to plain strings,
  // and this title already carries it.
  title: { absolute: HOME_TITLE },
  description: HOME_DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    url: SITE_URL,
    type: "website",
    images: [SITE_OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    images: [SITE_OG_IMAGE.url],
  },
};

export default async function Home() {
  const levelStats = await getLevelStats();

  const postsResult = await getPublishedBlogsByPage(1, 3);
  const posts = (postsResult.success && postsResult.data ? postsResult.data : []).map((b) => ({
    slug: b.slug,
    titleBn: b.titleBn,
    titleEn: b.titleEn,
    descriptionBn: b.descriptionBn,
    descriptionEn: b.descriptionEn,
    imageUrl: b.featuredMedia?.url ?? null,
    imageAlt: b.featuredMedia?.altText || b.featuredMedia?.name || null,
    createdAt: b.createdAt.toISOString(),
  }));

  const leaderboardResult = await getLeaderboard();
  const leaderboard = leaderboardResult.success && leaderboardResult.data ? leaderboardResult.data : [];

  return <HomeOrDashboard levelStats={levelStats} posts={posts} leaderboard={leaderboard} />;
}
