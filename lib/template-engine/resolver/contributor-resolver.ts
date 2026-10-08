import prisma from "@/utils/prisma";
import { SITE_NAME, SITE_URL } from "@/lib/site-config";
import { ResolvedTemplateData } from "../types";

export async function resolveContributorData(userId: number): Promise<ResolvedTemplateData | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        user_name: true,
        image: true,
        role: true,
        created_at: true,
        _count: {
          select: {
            addedWords: { where: { isPending: false } },
            addedQuestions: { where: { isPending: false } },
          },
        },
      },
    });

    if (!user) return null;

    const baseUrl = SITE_URL || "https://zeroenglish.org";
    const profileUrl = `${baseUrl}/profile/${user.id}`;
    const wordCount = user._count?.addedWords || 0;
    const quizCount = user._count?.addedQuestions || 0;
    const totalCount = wordCount + quizCount;

    const issueDate = new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date());

    const serial = `ZE-CERT-${new Date().getFullYear()}-${String(user.id).padStart(4, "0")}`;

    const roleLabel =
      user.role === "admin"
        ? "Lead Administrator"
        : user.role === "contributor"
        ? "Certified Contributor"
        : "Community Member";

    const data: ResolvedTemplateData = {
      "{{contributor.name}}": user.name || user.user_name || "Contributor",
      "{{contributor.username}}": `@${user.user_name}`,
      "{{contributor.role}}": roleLabel,
      "{{contributor.profilePhoto}}":
        user.image ||
        `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
          user.name || user.user_name || "ZE"
        )}`,
      "{{contributor.contributionCount}}": `${totalCount}`,
      "{{contributor.wordCount}}": `${wordCount}`,
      "{{contributor.quizCount}}": `${quizCount}`,
      "{{contributor.issueDate}}": issueDate,
      "{{contributor.certificateId}}": serial,
      "{{contributor.profileUrl}}": profileUrl,
      "{{site.name}}": SITE_NAME || "Zero English",
      "{{site.url}}": baseUrl,
      "{{site.tagline}}": "Master English Without Fear",
    };

    return data;
  } catch (err) {
    console.error(`[ContributorResolver] Error resolving contributor #${userId}:`, err);
    return null;
  }
}
