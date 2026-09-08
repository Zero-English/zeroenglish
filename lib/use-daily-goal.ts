"use client";

import { useState, useEffect, useCallback } from "react";
import { getWordsByType } from "./db";
import { useAuthPath, useAuthStatus } from "./auth-store";

const DAILY_GOAL_KEY = "voc_daily_goal";

function fmt(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function getDaysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return fmt(d);
}

interface ServerDailyActivity {
  daily: { date: string; count: number }[];
  todayLearned: number;
  streak: number;
}

async function fetchServerDailyActivity(): Promise<ServerDailyActivity | null> {
  try {
    const res = await fetch("/api/v1/words/daily-activity", { cache: "no-store" });
    if (!res.ok) return null;
    const body = (await res.json()) as {
      data?: { daily?: { date: string; count: number }[]; todayLearned?: number; streak?: number };
      success?: boolean;
    };
    if (!body.success || !body.data || !Array.isArray(body.data.daily)) return null;
    return {
      daily: body.data.daily,
      todayLearned: body.data.todayLearned ?? 0,
      streak: body.data.streak ?? 0,
    };
  } catch (err) {
    console.error("Failed to fetch daily activity from server:", err);
    return null;
  }
}

export function useDailyGoal() {
  const { path, hydrated } = useAuthPath();
  const { status } = useAuthStatus();
  const [dailyGoal, setDailyGoalState] = useState(10);
  const [todayLearned, setTodayLearned] = useState(0);
  const [streak, setStreak] = useState(0);
  const [contributionData, setContributionData] = useState<
    { date: string; count: number }[]
  >([]);
  const [loaded, setLoaded] = useState(false);

  const goalKey = hydrated ? `${DAILY_GOAL_KEY}_${path}` : "";

  const loadLocal = useCallback(
    async (pageGoalKey: string, pagePath: string) => {
      let goalStored = localStorage.getItem(pageGoalKey);
      if (!goalStored) {
        const legacy = localStorage.getItem(DAILY_GOAL_KEY);
        if (legacy) {
          localStorage.setItem(pageGoalKey, legacy);
          localStorage.removeItem(DAILY_GOAL_KEY);
          goalStored = legacy;
        }
      }
      if (goalStored) setDailyGoalState(parseInt(goalStored, 10) || 10);
      const records = await getWordsByType("learned", pagePath);

      const dayCounts: Record<string, number> = {};
      for (const r of records) {
        if (!r.timestamp) continue;
        const d = new Date(r.timestamp);
        const s = fmt(d);
        dayCounts[s] = (dayCounts[s] || 0) + 1;
      }

      const today = fmt(new Date());
      setTodayLearned(dayCounts[today] || 0);

      let cStreak = 0;
      for (let i = 0; ; i++) {
        const day = getDaysAgo(i);
        if (!dayCounts[day]) break;
        cStreak++;
      }
      setStreak(cStreak);

      const data: { date: string; count: number }[] = [];
      for (let i = 364; i >= 0; i--) {
        const day = getDaysAgo(i);
        data.push({ date: day, count: dayCounts[day] || 0 });
      }
      setContributionData(data);
    },
    []
  );

  useEffect(() => {
    if (!hydrated) return;
    void (async () => {
      setLoaded(false);
      if (goalKey) {
        const legacy = localStorage.getItem(DAILY_GOAL_KEY);
        if (legacy && !localStorage.getItem(goalKey)) {
          localStorage.setItem(goalKey, legacy);
          localStorage.removeItem(DAILY_GOAL_KEY);
        }
        const goalStored = localStorage.getItem(goalKey) || legacy;
        if (goalStored) setDailyGoalState(parseInt(goalStored, 10) || 10);
      }

      if (status === "google") {
        const server = await fetchServerDailyActivity();
        if (server) {
          setContributionData(server.daily);
          setTodayLearned(server.todayLearned);
          setStreak(server.streak);
          setLoaded(true);
          return;
        }
      }

      await loadLocal(goalKey, path);
      setLoaded(true);
    })();
  }, [path, hydrated, goalKey, status, loadLocal]);

  const setDailyGoal = useCallback(
    (n: number) => {
      setDailyGoalState(n);
      localStorage.setItem(`${DAILY_GOAL_KEY}_${path}`, String(n));
    },
    [path]
  );

  const refresh = useCallback(() => {
    void (async () => {
      setLoaded(false);
      if (status === "google") {
        const server = await fetchServerDailyActivity();
        if (server) {
          setContributionData(server.daily);
          setTodayLearned(server.todayLearned);
          setStreak(server.streak);
          setLoaded(true);
          return;
        }
      }
      await loadLocal(goalKey, path);
      setLoaded(true);
    })();
  }, [status, loadLocal, goalKey, path]);

  return {
    dailyGoal,
    setDailyGoal,
    todayLearned,
    streak,
    contributionData,
    loaded: loaded && hydrated,
    refresh,
  };
}