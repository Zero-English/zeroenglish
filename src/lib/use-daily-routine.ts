"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getWordsByType } from "./db";
import { useAuthPath, useAuthStatus } from "./auth-store";
import {
  DEFAULT_ROUTINE_TARGETS,
  ROUTINE_ACTIVITY_KEYS,
  ROUTINE_ACTIVITY_META,
  type DailyRoutineHistoryEntry,
  type DailyRoutineItem,
  type DailyRoutinePayload,
  type DailyRoutineSummary,
  type RoutineTargets,
} from "./daily-routine";

const LOCAL_GOAL_KEY = "voc_daily_goal";
const HISTORY_DAYS = 365;

function fmt(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function getDaysAgo(n: number): string {
  const date = new Date();
  date.setDate(date.getDate() - n);
  return fmt(date);
}

function clientTimeZone(): string | undefined {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || undefined;
  } catch {
    return undefined;
  }
}

function clientDateKey(): string {
  return fmt(new Date());
}

function readStoredGoal(path: string): number | null {
  if (typeof window === "undefined") return null;
  const key = `${LOCAL_GOAL_KEY}_${path}`;
  let raw = localStorage.getItem(key);
  if (!raw) {
    const legacy = localStorage.getItem(LOCAL_GOAL_KEY);
    if (legacy) {
      raw = legacy;
      localStorage.setItem(key, legacy);
      localStorage.removeItem(LOCAL_GOAL_KEY);
    }
  }
  const parsed = raw ? Number.parseInt(raw, 10) : Number.NaN;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function emptySummary(): DailyRoutineSummary {
  return {
    completedItems: 0,
    totalItems: 0,
    percent: 0,
    allCompleted: false,
  };
}

function recomputeRoutine(
  previous: DailyRoutinePayload,
  targets: RoutineTargets
): DailyRoutinePayload {
  const items: DailyRoutineItem[] = previous.items.map((item) => {
    const config = targets[item.key];
    return {
      ...item,
      enabled: config.enabled,
      target: config.target,
      completed: config.enabled && item.progress >= config.target,
    };
  });

  const enabledItems = items.filter((item) => item.enabled);
  const completedItems = enabledItems.filter((item) => item.completed).length;
  const totalItems = enabledItems.length;

  return {
    ...previous,
    targets,
    items,
    summary: {
      completedItems,
      totalItems,
      percent:
        totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0,
      allCompleted: totalItems > 0 && completedItems === totalItems,
    },
  };
}

async function buildLocalRoutine(path: string): Promise<DailyRoutinePayload> {
  const storedGoal = readStoredGoal(path);
  const wordsTarget = storedGoal ?? DEFAULT_ROUTINE_TARGETS.words.target;

  const records = await getWordsByType("learned", path);
  const dayCounts: Record<string, number> = {};
  for (const record of records) {
    if (!record.timestamp) continue;
    const key = fmt(new Date(record.timestamp));
    dayCounts[key] = (dayCounts[key] ?? 0) + 1;
  }

  const targets: RoutineTargets = {
    ...DEFAULT_ROUTINE_TARGETS,
    words: { enabled: true, target: wordsTarget },
    quizQuestions: {
      ...DEFAULT_ROUTINE_TARGETS.quizQuestions,
      enabled: false,
    },
    grammarRules: { ...DEFAULT_ROUTINE_TARGETS.grammarRules, enabled: false },
    dailyPractice: {
      ...DEFAULT_ROUTINE_TARGETS.dailyPractice,
      enabled: false,
    },
  };

  const today = fmt(new Date());
  const items: DailyRoutineItem[] = ROUTINE_ACTIVITY_KEYS.map((key) => {
    const meta = ROUTINE_ACTIVITY_META[key];
    const config = targets[key];
    const progress = key === "words" ? dayCounts[today] ?? 0 : 0;
    return {
      key,
      labelEn: meta.labelEn,
      labelBn: meta.labelBn,
      unitEn: meta.unitEn,
      unitBn: meta.unitBn,
      href: meta.href,
      enabled: config.enabled,
      target: config.target,
      progress,
      completed: config.enabled && progress >= config.target,
    };
  });

  const history: DailyRoutineHistoryEntry[] = [];
  for (let i = HISTORY_DAYS - 1; i >= 0; i--) {
    const date = getDaysAgo(i);
    const count = dayCounts[date] ?? 0;
    history.push({ date, count: count >= wordsTarget ? 1 : 0 });
  }

  let streak = 0;
  const todayDone = (dayCounts[today] ?? 0) >= wordsTarget;
  const yesterday = getDaysAgo(1);
  const yesterdayDone = (dayCounts[yesterday] ?? 0) >= wordsTarget;
  if (todayDone || yesterdayDone) {
    for (let i = todayDone ? 0 : 1; ; i++) {
      if ((dayCounts[getDaysAgo(i)] ?? 0) >= wordsTarget) streak += 1;
      else break;
    }
  }

  const enabledItems = items.filter((item) => item.enabled);
  const completedItems = enabledItems.filter((item) => item.completed).length;

  return {
    date: today,
    timezone: clientTimeZone() ?? "Asia/Dhaka",
    targets,
    items,
    summary: {
      completedItems,
      totalItems: enabledItems.length,
      percent:
        enabledItems.length > 0
          ? Math.round((completedItems / enabledItems.length) * 100)
          : 0,
      allCompleted:
        enabledItems.length > 0 && completedItems === enabledItems.length,
    },
    streak,
    history,
    isDefault: true,
  };
}

async function fetchServerRoutine(): Promise<DailyRoutinePayload | null> {
  try {
    const params = new URLSearchParams();
    const timezone = clientTimeZone();
    if (timezone) params.set("tz", timezone);
    params.set("date", clientDateKey());

    const response = await fetch(
      `/api/v1/daily-routine?${params.toString()}`,
      { cache: "no-store" }
    );
    if (!response.ok) return null;
    const body = (await response.json()) as {
      success?: boolean;
      data?: DailyRoutinePayload | null;
    };
    if (!body.success || !body.data) return null;
    return body.data;
  } catch (error) {
    console.error("Failed to fetch daily routine from server:", error);
    return null;
  }
}

async function saveServerRoutine(
  targets: RoutineTargets
): Promise<DailyRoutinePayload> {
  const response = await fetch("/api/v1/daily-routine", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ timezone: clientTimeZone(), targets }),
  });
  const body = (await response.json()) as {
    success?: boolean;
    data?: DailyRoutinePayload | null;
    message?: string;
  };
  if (!response.ok || !body.success || !body.data) {
    throw new Error(body.message ?? "Failed to save daily routine");
  }
  return body.data;
}

export function useDailyRoutine() {
  const { path, hydrated } = useAuthPath();
  const { status } = useAuthStatus();
  const [data, setData] = useState<DailyRoutinePayload | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const importedLegacyGoalFor = useRef<string | null>(null);

  const refresh = useCallback(async () => {
    if (!hydrated) return;
    setLoaded(false);
    setError(null);

    if (status === "google") {
      let server = await fetchServerRoutine();
      if (server) {
        // One-time migration of the old localStorage word goal into the DB.
        if (server.isDefault && importedLegacyGoalFor.current !== path) {
          importedLegacyGoalFor.current = path;
          const storedGoal = readStoredGoal(path);
          if (storedGoal && storedGoal !== server.targets.words.target) {
            try {
              server = await saveServerRoutine({
                ...server.targets,
                words: {
                  ...server.targets.words,
                  enabled: true,
                  target: storedGoal,
                },
              });
              localStorage.removeItem(`${LOCAL_GOAL_KEY}_${path}`);
            } catch (saveError) {
              console.error("Failed to migrate local daily goal:", saveError);
            }
          }
        }
        setData(server);
        setLoaded(true);
        return;
      }
    }

    setData(await buildLocalRoutine(path));
    setLoaded(true);
  }, [hydrated, status, path]);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) void refresh();
    });
    return () => {
      cancelled = true;
    };
  }, [refresh]);

  const updateTargets = useCallback(
    async (nextTargets: RoutineTargets) => {
      if (status !== "google") {
        if (typeof window !== "undefined") {
          localStorage.setItem(
            `${LOCAL_GOAL_KEY}_${path}`,
            String(nextTargets.words.target)
          );
        }
        setData((previous) =>
          previous ? recomputeRoutine(previous, nextTargets) : previous
        );
        return true;
      }

      const previous = data;
      setSaving(true);
      setError(null);
      setData((current) =>
        current ? recomputeRoutine(current, nextTargets) : current
      );

      try {
        setData(await saveServerRoutine(nextTargets));
        return true;
      } catch (saveError) {
        const message =
          saveError instanceof Error
            ? saveError.message
            : "Failed to save daily routine";
        setError(message);
        if (previous) setData(previous);
        return false;
      } finally {
        setSaving(false);
      }
    },
    [data, path, status]
  );

  return {
    data,
    targets: data?.targets ?? DEFAULT_ROUTINE_TARGETS,
    items: data?.items ?? [],
    summary: data?.summary ?? emptySummary(),
    streak: data?.streak ?? 0,
    history: data?.history ?? [],
    loaded: loaded && hydrated,
    saving,
    error,
    refresh,
    updateTargets,
  };
}

