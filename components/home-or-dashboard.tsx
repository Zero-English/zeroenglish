"use client";

import type { Word } from "@/lib/data";
import { useAuthStatus } from "@/lib/auth-store";
import { HomeContent } from "@/components/home-content";
import { Dashboard } from "@/components/dashboard/dashboard";

export function HomeOrDashboard({ words }: { words: Word[] }) {
  const { status, hydrated } = useAuthStatus();

  if (hydrated && status !== "none") {
    return <Dashboard words={words} />;
  }

  return <HomeContent words={words} />;
}