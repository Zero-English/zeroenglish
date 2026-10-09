import { Metadata } from "next";
import { getLeaderboard } from "@/services/user.service";
import { Leaderboard } from "@/components/leaderboard";
import { BackButton } from "@/components/back-button";

export const metadata: Metadata = {
    title: "Weekly Quiz Leaderboard",
    description:
        "See who scored highest on this week's Zero English quizzes, ranked by average score across every exam they took.",
    alternates: { canonical: "/leaderboard" },
};

// Cached for 5 minutes via ISR
export const revalidate = 300;

export default async function LeaderboardPage() {
    const result = await getLeaderboard();
    const rows = result.success && result.data ? result.data : [];

    return (
        <div className="relative min-h-dvh overflow-hidden">
            <div className="relative px-4 py-10 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-6xl">
                    <BackButton />
                    <div className="mt-4">
                        <Leaderboard rows={rows} />
                    </div>
                </div>
            </div>
        </div>
    );
}