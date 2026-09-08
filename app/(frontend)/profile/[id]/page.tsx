import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getUserById, getUserLearningProgress } from "@/services/user.service";
import { getAllWords } from "@/lib/data";
import { PublicProfileView } from "@/components/public-profile";
import { BackButton } from "@/components/back-button";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const userId = parseInt(id, 10);

  if (Number.isNaN(userId) || userId < 1) {
    return { title: "Profile Not Found" };
  }

  const result = await getUserById(userId);
  const displayName =
    result.success && result.data
      ? result.data.name || result.data.user_name
      : null;

  return {
    title: displayName ? `${displayName} | Profile | Zero English` : "Profile | Zero English",
    description: displayName
      ? `Public profile of ${displayName} on Zero English — track learned words and quiz progress.`
      : "Public profile on Zero English.",
  };
}

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const userId = parseInt(id, 10);

  if (Number.isNaN(userId) || userId < 1) {
    notFound();
  }

  const [result, progressResult, words] = await Promise.all([
    getUserById(userId),
    getUserLearningProgress(userId),
    getAllWords(),
  ]);

  if (!result.success || !result.data) {
    notFound();
  }

  const { data } = result;

  const levelProgress =
    progressResult.success && progressResult.data
      ? words
          .reduce<{ level: string; total: number; learned: number }[]>((acc, w) => {
            const existing = acc.find((l) => l.level === w.level);
            if (existing) existing.total += 1;
            else acc.push({ level: w.level, total: 1, learned: 0 });
            return acc;
          }, [])
          .map((l) => ({
            ...l,
            learned: progressResult.data.levelCounts[l.level] ?? 0,
          }))
      : [];

  const dailyData =
    progressResult.success && progressResult.data ? progressResult.data.daily : [];

  return (
    <div className="relative min-h-dvh overflow-hidden">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_left,var(--tw-gradient-stops))] from-zinc-100 via-white to-zinc-50 dark:from-zinc-900 dark:via-zinc-950 dark:to-black" />
      <div className="fixed inset-0 -z-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMCAwaDQwdjQwSDB6IiBmaWxsPSJub25lIi8+PHBhdGggZD0iTTIwIDIwbDEwIDEwTTIwIDIwbC0xMCAxME0yMCAyMGwxMC0xME0yMCAyMGwtMTAtMTAiIHN0cm9rZT0iY3VycmVudENvbG9yIiBzdHJva2Utd2lkdGg9Ii41IiBzdHJva2Utb3BhY2l0eT0iLjA0Ii8+PC9zdmc+')] opacity-50" />

      <div className="relative px-4 py-8 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <BackButton />
          <PublicProfileView
            user={{
              id: data.id,
              name: data.name,
              userName: data.user_name,
              image: data.image,
              role: data.role,
              createdAt: data.created_at.toISOString(),
              learnedCount: data.learnedWordCount,
              stillLearningCount: data.stillLearningCount,
              bookmarkedCount: data.bookmarkedCount,
            }}
            totalWords={words.length}
            levelProgress={levelProgress}
            dailyData={dailyData}
          />
        </div>
      </div>
    </div>
  );
}