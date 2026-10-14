"use client";

import { useState, useEffect, useCallback, useSyncExternalStore } from "react";
import { type GrammarRule } from "@/data/grammar-data";

const STORAGE_KEY = "zero_grammar_progress_v1";

interface StoredProgress {
  completedRuleIds: string[];
  bookmarkedRuleIds: string[];
  visitedRuleIds: string[];
  completedTimestamps: Record<string, string>;
  lastVisitedRuleId?: string;
}

const defaultProgress: StoredProgress = {
  completedRuleIds: [],
  bookmarkedRuleIds: [],
  visitedRuleIds: [],
  completedTimestamps: {},
};

// Event listener for cross-tab or cross-component synchronisation
const listeners = new Set<() => void>();

function emitChange() {
  for (const listener of listeners) {
    listener();
  }
}

function getStoredProgress(): StoredProgress {
  if (typeof window === "undefined") {
    return defaultProgress;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultProgress;
    const parsed = JSON.parse(raw);
    return {
      completedRuleIds: Array.isArray(parsed.completedRuleIds)
        ? parsed.completedRuleIds
        : [],
      bookmarkedRuleIds: Array.isArray(parsed.bookmarkedRuleIds)
        ? parsed.bookmarkedRuleIds
        : [],
      visitedRuleIds: Array.isArray(parsed.visitedRuleIds)
        ? parsed.visitedRuleIds
        : [],
      completedTimestamps:
        typeof parsed.completedTimestamps === "object" &&
        parsed.completedTimestamps !== null
          ? parsed.completedTimestamps
          : {},
      lastVisitedRuleId: parsed.lastVisitedRuleId,
    };
  } catch {
    return defaultProgress;
  }
}

function saveStoredProgress(progress: StoredProgress) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    emitChange();
  } catch (e) {
    console.error("Failed to save grammar progress", e);
  }
}

let cachedSnapshot: StoredProgress = defaultProgress;

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

function getSnapshot(): StoredProgress {
  if (typeof window === "undefined") return defaultProgress;
  const current = getStoredProgress();
  // Simple shallow check to prevent infinite re-renders
  if (
    current.completedRuleIds.length !== cachedSnapshot.completedRuleIds.length ||
    current.bookmarkedRuleIds.length !== cachedSnapshot.bookmarkedRuleIds.length ||
    current.visitedRuleIds.length !== cachedSnapshot.visitedRuleIds.length ||
    current.lastVisitedRuleId !== cachedSnapshot.lastVisitedRuleId
  ) {
    cachedSnapshot = current;
  }
  return cachedSnapshot;
}

function getServerSnapshot(): StoredProgress {
  return defaultProgress;
}

export function useGrammarProgress() {
  const isClient = typeof window !== "undefined";
  const progress = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const isCompleted = useCallback(
    (ruleId: string) => progress.completedRuleIds.includes(ruleId),
    [progress.completedRuleIds]
  );

  const isBookmarked = useCallback(
    (ruleId: string) => progress.bookmarkedRuleIds.includes(ruleId),
    [progress.bookmarkedRuleIds]
  );

  const isVisited = useCallback(
    (ruleId: string) => progress.visitedRuleIds.includes(ruleId),
    [progress.visitedRuleIds]
  );

  const toggleCompleted = useCallback((ruleId: string) => {
    const current = getStoredProgress();
    const isAlreadyCompleted = current.completedRuleIds.includes(ruleId);
    let nextCompleted: string[];
    const nextTimestamps = { ...current.completedTimestamps };

    if (isAlreadyCompleted) {
      nextCompleted = current.completedRuleIds.filter((id) => id !== ruleId);
      delete nextTimestamps[ruleId];
    } else {
      nextCompleted = [...current.completedRuleIds, ruleId];
      nextTimestamps[ruleId] = new Date().toISOString();
    }

    const nextVisited = current.visitedRuleIds.includes(ruleId)
      ? current.visitedRuleIds
      : [...current.visitedRuleIds, ruleId];

    saveStoredProgress({
      ...current,
      completedRuleIds: nextCompleted,
      completedTimestamps: nextTimestamps,
      visitedRuleIds: nextVisited,
    });

    // Background server sync if available
    try {
      fetch(`/api/v1/grammar/rules/${ruleId}/progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isCompleted: !isAlreadyCompleted, isVisited: true }),
      }).catch(() => {});
    } catch {
      // Ignore background fetch failure
    }

    return !isAlreadyCompleted;
  }, []);

  const toggleBookmark = useCallback((ruleId: string) => {
    const current = getStoredProgress();
    const isAlreadyBookmarked = current.bookmarkedRuleIds.includes(ruleId);
    const nextBookmarked = isAlreadyBookmarked
      ? current.bookmarkedRuleIds.filter((id) => id !== ruleId)
      : [...current.bookmarkedRuleIds, ruleId];

    saveStoredProgress({
      ...current,
      bookmarkedRuleIds: nextBookmarked,
    });

    // Background server sync if available
    try {
      fetch(`/api/v1/grammar/rules/${ruleId}/bookmark`, {
        method: "POST",
      }).catch(() => {});
    } catch {
      // Ignore background fetch failure
    }

    return !isAlreadyBookmarked;
  }, []);

  const markCompleted = useCallback((ruleId: string) => {
    const current = getStoredProgress();
    if (!current.completedRuleIds.includes(ruleId)) {
      saveStoredProgress({
        ...current,
        completedRuleIds: [...current.completedRuleIds, ruleId],
        completedTimestamps: {
          ...current.completedTimestamps,
          [ruleId]: new Date().toISOString(),
        },
        visitedRuleIds: current.visitedRuleIds.includes(ruleId)
          ? current.visitedRuleIds
          : [...current.visitedRuleIds, ruleId],
      });

      try {
        fetch(`/api/v1/grammar/rules/${ruleId}/progress`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isCompleted: true, isVisited: true }),
        }).catch(() => {});
      } catch {}
    }
  }, []);

  const markVisited = useCallback((ruleId: string) => {
    const current = getStoredProgress();
    if (!current.visitedRuleIds.includes(ruleId)) {
      saveStoredProgress({
        ...current,
        visitedRuleIds: [...current.visitedRuleIds, ruleId],
        lastVisitedRuleId: ruleId,
      });
    } else if (current.lastVisitedRuleId !== ruleId) {
      saveStoredProgress({
        ...current,
        lastVisitedRuleId: ruleId,
      });
    }
  }, []);

  const getCategoryStats = useCallback(
    (rules: GrammarRule[]) => {
      const totalCount = rules.length;
      if (totalCount === 0) return { completedCount: 0, totalCount: 0, percent: 0 };
      const completedCount = rules.filter((r) =>
        progress.completedRuleIds.includes(r.id)
      ).length;
      const percent = Math.round((completedCount / totalCount) * 100);
      return { completedCount, totalCount, percent };
    },
    [progress.completedRuleIds]
  );

  const resetCategoryProgress = useCallback((rules: GrammarRule[]) => {
    const current = getStoredProgress();
    const ruleIds = new Set(rules.map((r) => r.id));
    const nextCompleted = current.completedRuleIds.filter((id) => !ruleIds.has(id));
    const nextVisited = current.visitedRuleIds.filter((id) => !ruleIds.has(id));
    const nextTimestamps = { ...current.completedTimestamps };
    for (const id of ruleIds) {
      delete nextTimestamps[id];
    }
    saveStoredProgress({
      ...current,
      completedRuleIds: nextCompleted,
      visitedRuleIds: nextVisited,
      completedTimestamps: nextTimestamps,
    });
  }, []);

  const syncFromServer = useCallback(
    (completedSlugs: string[], bookmarkedSlugs: string[]) => {
      const current = getStoredProgress();
      const mergedCompleted = Array.from(
        new Set([...current.completedRuleIds, ...completedSlugs])
      );
      const mergedBookmarked = Array.from(
        new Set([...current.bookmarkedRuleIds, ...bookmarkedSlugs])
      );
      saveStoredProgress({
        ...current,
        completedRuleIds: mergedCompleted,
        bookmarkedRuleIds: mergedBookmarked,
      });
    },
    []
  );

  return {
    isClient,
    progress,
    isCompleted,
    isBookmarked,
    isVisited,
    toggleCompleted,
    toggleBookmark,
    markCompleted,
    markVisited,
    getCategoryStats,
    resetCategoryProgress,
    syncFromServer,
  };
}
