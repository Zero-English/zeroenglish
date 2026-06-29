"use client";

import { useState, useEffect } from "react";
import { getAllActivity } from "./db";

export function useQuizActivity() {
  const [totalCorrectAnswers, setTotalCorrectAnswers] = useState(0);
  const [quizzesThisWeek, setQuizzesThisWeek] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      const activityRecords = await getAllActivity();
      let correct = 0;
      let week = 0;
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const weekAgoStr = `${weekAgo.getFullYear()}-${String(weekAgo.getMonth() + 1).padStart(2, "0")}-${String(weekAgo.getDate()).padStart(2, "0")}`;

      for (const r of activityRecords) {
        correct += r.correctAnswers ?? 0;
        if (r.date >= weekAgoStr) {
          week += r.quizzesDone;
        }
      }

      setTotalCorrectAnswers(correct);
      setQuizzesThisWeek(week);
      setLoaded(true);
    })();
  }, []);

  return { totalCorrectAnswers, quizzesThisWeek, loaded };
}
