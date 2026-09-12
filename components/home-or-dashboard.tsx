"use client";

import type { Word } from "@/lib/data";
import { useAuthStatus } from "@/lib/auth-store";
import { HomeContent } from "@/components/home-content";
import { Dashboard } from "@/components/dashboard/dashboard";
import type { LatestPost } from "@/components/news/latest-posts";

export function HomeOrDashboard({
  words,
  posts,
}: {
  words: Word[];
  posts: LatestPost[];
}) {
  const { status, hydrated } = useAuthStatus();

  if (hydrated && status !== "none") {
    return <Dashboard words={words} posts={posts} />;
  }

  return <HomeContent words={words} posts={posts} />;
}