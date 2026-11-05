"use client";

import { useCallback } from "react";
import { useDailyRoutine } from "./use-daily-routine";

/**
 * Backwards-compatible view over the universal daily routine.
 *
 * Existing consumers (dashboard, vocabulary) only care about the words item,
 * so this hook keeps exposing the old word-centric shape while the profile
 * card uses `useDailyRoutine` directly.
 */
export function useDailyGoal() {
  const routine = useDailyRoutine();
  const { targets, updateTargets } = routine;
  const wordsItem = routine.items.find((item) => item.key === "words");

  const dailyGoal = wordsItem?.target ?? targets.words.target;
  const todayLearned = wordsItem?.progress ?? 0;

  const setDailyGoal = useCallback(
    (value: number) => {
      const target = Number.isFinite(value) && value > 0 ? Math.round(value) : 10;
      void updateTargets({
        ...targets,
        words: { ...targets.words, enabled: true, target },
      });
    },
    [targets, updateTargets]
  );

  return {
    dailyGoal,
    setDailyGoal,
    todayLearned,
    streak: routine.streak,
    contributionData: routine.history,
    loaded: routine.loaded,
    refresh: routine.refresh,
  };
}
