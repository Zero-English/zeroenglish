"use client";

import { useState, useEffect, useCallback } from "react";
import { getWordsByType, getAllActivity } from "./db";

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
  const [dailyGoal, setDailyGoalState] = useState(10);
  const [todayLearned, setTodayLearned] = useState(0);
  const [streak, setStreak] = useState(0);
  const [contributionData, setContributionData] = useState<
    { date: string; count: number }[]
  >([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(DAILY_GOAL_KEY);
    if (stored) setDailyGoalState(parseInt(stored, 10) || 10);
  }, []);

  useEffect(() => {
    (async () => {
      const [records, activityRecords] = await Promise.all([
        getWordsByType("learned"),
        getAllActivity(),
      ]);

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
  }, []);

  const setDailyGoal = useCallback((n: number) => {
    setDailyGoalState(n);
    localStorage.setItem(DAILY_GOAL_KEY, String(n));
  }, []);

  const refresh = useCallback(() => {
    setLoaded(false);
    (async () => {
      const records = await getWordsByType("learned");
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
  }, []);

  return {
    dailyGoal,
    setDailyGoal,
    todayLearned,
    streak,
    contributionData,
    loaded,
    refresh,
  };
}
