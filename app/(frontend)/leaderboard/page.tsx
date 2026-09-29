import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getLeaderboard } from "@/services/user.service";
import { Leaderboard } from "@/components/leaderboard";
import { BackButton } from "@/components/back-button";

export const metadata: Metadata = {
    title: "Weekly Quiz Leaderboard",
    description:
        "See who scored highest on this week's Zero English quizzes, ranked by average score across every exam they took.",
    alternates: { canonical: "/leaderboard" },
};

export const dynamic = "force-dynamic";

export default async function LeaderboardPage() {
    const session = await getServerSession(authOptions);
    const userId = typeof session?.user?.id === "number" ? session.user.id : undefined;
    const result = await getLeaderboard();
    const rows = result.success && result.data ? result.data : [];

    return (
        <div className="relative min-h-dvh overflow-hidden">
            <div className="relative px-4 py-10 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-6xl">
                    <BackButton />
                    <div className="mt-4">
                        <Leaderboard rows={rows} currentUserId={userId} />
                    </div>
                </div>
            </div>
        </div>
    );
}