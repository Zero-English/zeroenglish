"use client";

import { useState, useEffect } from "react";
import { getAllActivity } from "./db";

function fmt(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function useQuizActivity() {
  const [totalQuizzes, setTotalQuizzes] = useState(0);
  const [todayQuizzes, setTodayQuizzes] = useState(0);
  const [quizzesThisWeek, setQuizzesThisWeek] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      const activityRecords = await getAllActivity();
      let total = 0;
      let today = 0;
      let week = 0;
      const todayStr = fmt(new Date());
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const weekAgoStr = fmt(weekAgo);

      for (const r of activityRecords) {
        total += r.quizzesDone;
        if (r.date === todayStr) {
          today += r.quizzesDone;
        }
        if (r.date >= weekAgoStr) {
          week += r.quizzesDone;
        }
      }

      setTotalQuizzes(total);
      setTodayQuizzes(today);
      setQuizzesThisWeek(week);
      setLoaded(true);
    })();
  }, []);

  return { totalQuizzes, todayQuizzes, quizzesThisWeek, loaded };
}
