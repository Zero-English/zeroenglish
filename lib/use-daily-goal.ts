"use client";

import { useState, useEffect, useCallback } from "react";
import { getWordsByType } from "./db";
import { useAuthPath } from "./auth-store";

const DAILY_GOAL_KEY = "voc_daily_goal";

function fmt(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function getDaysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return fmt(d);
}

export function useDailyGoal() {
  const { path, hydrated } = useAuthPath();
  const [dailyGoal, setDailyGoalState] = useState(10);
  const [todayLearned, setTodayLearned] = useState(0);
  const [streak, setStreak] = useState(0);
  const [contributionData, setContributionData] = useState<
    { date: string; count: number }[]
  >([]);
  const [loaded, setLoaded] = useState(false);

  const goalKey = hydrated ? `${DAILY_GOAL_KEY}_${path}` : "";

  useEffect(() => {
    if (!hydrated) return;
    (async () => {
      setLoaded(false);
      let goalStored = localStorage.getItem(goalKey);
      if (!goalStored) {
        const legacy = localStorage.getItem(DAILY_GOAL_KEY);
        if (legacy) {
          localStorage.setItem(goalKey, legacy);
          localStorage.removeItem(DAILY_GOAL_KEY);
          goalStored = legacy;
        }
      }
      if (goalStored) setDailyGoalState(parseInt(goalStored, 10) || 10);
      const records = await getWordsByType("learned", path);

      const dayCounts: Record<string, number> = {};
      for (const r of records) {
        if (!r.timestamp) continue;
        const d = new Date(r.timestamp);
        const s = fmt(d);
        dayCounts[s] = (dayCounts[s] || 0) + 1;
      }

      const today = fmt(new Date());
      setTodayLearned(dayCounts[today] || 0);

      let s = 0;
      for (let i = 0; ; i++) {
        const day = getDaysAgo(i);
        if (!dayCounts[day]) break;
        s++;
      }
      setStreak(s);

      const data: { date: string; count: number }[] = [];
      for (let i = 364; i >= 0; i--) {
        const day = getDaysAgo(i);
        data.push({ date: day, count: dayCounts[day] || 0 });
      }
      setContributionData(data);

      setLoaded(true);
    })();
  }, [path, hydrated, goalKey]);

  const setDailyGoal = useCallback(
    (n: number) => {
      setDailyGoalState(n);
      localStorage.setItem(`${DAILY_GOAL_KEY}_${path}`, String(n));
    },
    [path]
  );

  const refresh = useCallback(() => {
    setLoaded(false);
    (async () => {
      const records = await getWordsByType("learned", path);
      const dayCounts: Record<string, number> = {};
      for (const r of records) {
        if (!r.timestamp) continue;
        const d = new Date(r.timestamp);
        const s = fmt(d);
        dayCounts[s] = (dayCounts[s] || 0) + 1;
      }

      const today = fmt(new Date());
      setTodayLearned(dayCounts[today] || 0);

      let s = 0;
      for (let i = 0; ; i++) {
        const day = getDaysAgo(i);
        if (!dayCounts[day]) break;
        s++;
      }
      setStreak(s);
      setLoaded(true);
    })();
  }, [path]);

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