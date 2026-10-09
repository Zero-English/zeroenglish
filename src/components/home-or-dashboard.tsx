"use client";

import { useAuthStatus } from "@/lib/auth-store";
import { HomeContent } from "@/components/home-content";
import { Dashboard } from "@/components/dashboard/dashboard";
import type { LatestPost } from "@/components/news/latest-posts";
import type { LeaderboardRow } from "@/components/leaderboard";

export interface LevelStatItem {
  level: string;
  count: number;
}

export function HomeOrDashboard({
  levelStats,
  posts,
  leaderboard,
}: {
  levelStats: LevelStatItem[];
  posts: LatestPost[];
  leaderboard: LeaderboardRow[];
}) {
  const { status, hydrated } = useAuthStatus();

  if (hydrated && status !== "none") {
    return <Dashboard levelStats={levelStats} posts={posts} leaderboard={leaderboard} />;
  }

  return <HomeContent levelStats={levelStats} posts={posts} leaderboard={leaderboard} />;
}