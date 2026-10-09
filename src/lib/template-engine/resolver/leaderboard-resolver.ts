import prisma from "@/utils/prisma";
import { SITE_NAME, SITE_URL } from "@/lib/site-config";
import { ResolvedTemplateData } from "../types";

export async function resolveLeaderboardData(userIdOrResultId: number): Promise<ResolvedTemplateData | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userIdOrResultId },
      select: {
        id: true,
        name: true,
        user_name: true,
        image: true,
        role: true,
        _count: {
          select: {
            addedQuestions: true,
            addedWords: true,
            relatedWords: true,
          },
        },
      },
    });

    if (!user) return null;

    const baseUrl = SITE_URL || "https://zeroenglish.org";
    const avatarUrl = user.image || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop";
    const totalScore = (user._count.addedQuestions * 10) + (user._count.addedWords * 5) + (user._count.relatedWords * 2);

    const data: ResolvedTemplateData = {
      "{{leaderboard.rank}}": "#1 Top Scorer",
      "{{leaderboard.userName}}": user.name || (user.user_name ? `@${user.user_name}` : "Participant"),
      "{{leaderboard.userPhoto}}": avatarUrl,
      "{{leaderboard.score}}": `${totalScore > 0 ? totalScore : 100} pts`,
      "{{leaderboard.accuracy}}": "98%",
      "{{leaderboard.period}}": "Weekly Quiz Leaderboard",
      "{{leaderboard.badge}}": user.role === "admin" ? "Master Instructor" : "Grammar Champion",
      "{{leaderboard.url}}": `${baseUrl}/leaderboard`,
      "{{site.name}}": SITE_NAME || "Zero English",
      "{{site.url}}": baseUrl,
      "{{site.tagline}}": "Master English Without Fear",
      "{{site.logo}}": `${baseUrl}/assets/logo/logo-full.webp`,
      "{{site.callToAction}}": "Test your English skills at zeroenglish.org",
    };

    return data;
  } catch (err) {
    console.error(`[LeaderboardResolver] Error resolving leaderboard data for user #${userIdOrResultId}:`, err);
    return null;
  }
}
