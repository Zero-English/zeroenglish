import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getLevelStats } from "@/lib/data";
import { Dashboard } from "@/components/dashboard/dashboard";
import { getPublishedBlogsByPage } from "@/services/blog.service";
import { getLeaderboard } from "@/services/user.service";

export const metadata: Metadata = {
  title: "Dashboard",
  description:
    "Your personalized Zero English dashboard with daily goals, progress and activity.",
  robots: { index: false, follow: false },
};

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/join");
  }

  const levelStats = await getLevelStats();

  const postsResult = await getPublishedBlogsByPage(1, 3);
  const posts = (
    postsResult.success && postsResult.data ? postsResult.data : []
  ).map((blog) => ({
    slug: blog.slug,
    titleBn: blog.titleBn,
    titleEn: blog.titleEn,
    descriptionBn: blog.descriptionBn,
    descriptionEn: blog.descriptionEn,
    imageUrl: blog.featuredMedia?.url ?? null,
    imageAlt:
      blog.featuredMedia?.altText || blog.featuredMedia?.name || null,
    createdAt: blog.createdAt.toISOString(),
  }));

  const leaderboardResult = await getLeaderboard();
  const leaderboard =
    leaderboardResult.success && leaderboardResult.data
      ? leaderboardResult.data
      : [];

  return (
    <Dashboard
      levelStats={levelStats}
      posts={posts}
      leaderboard={leaderboard}
    />
  );
}
