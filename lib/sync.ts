"use client";

import { create } from "zustand";
import { useAuthStore } from "@/lib/auth-store";
import {
  useQuizHistoryStore,
  type QuizHistoryEntry,
} from "@/lib/quiz-history-store";
import { getWordsByType, setWordSynced } from "@/lib/db";
import {
  fetchQuizResultsFromDb,
  dbResultDate,
  type DbQuizResult,
} from "@/lib/quiz-results-api";

export type SyncStatus = "idle" | "syncing" | "success" | "failed";

export interface SyncState {
  status: SyncStatus;
  pendingQuiz: number;
  pendingLearned: number;
  pendingBookmarked: number;
  lastSyncedAt: number | null;
  lastError: string | null;
  setState: (patch: Partial<SyncState>) => void;
}

export const useSyncStore = create<SyncState>()((set) => ({
  status: "idle",
  pendingQuiz: 0,
  pendingLearned: 0,
  pendingBookmarked: 0,
  lastSyncedAt: null,
  lastError: null,
  setState: (patch) => set(patch),
}));

const CLIENT_TO_DB_QUIZ_TYPE: Record<string, string> = {
  english_to_bangla: "ENGLISH_TO_BANGLA",
  bangla_to_english: "BANGLA_TO_ENGLISH",
  synonym: "SYNONYMS",
  antonym: "ANTONYMS",
};

const VALID_LEVELS = new Set(["A1", "A2", "B1", "B2", "C1", "C2"]);

function quizScore(e: QuizHistoryEntry): number {
  const n = parseInt(e.win, 10);
  return Number.isFinite(n) ? n : 0;
}

function quizEntryKey(e: QuizHistoryEntry): string {
  return [
    CLIENT_TO_DB_QUIZ_TYPE[e.quizType] ?? e.quizType,
    quizScore(e),
    e.numberOfQuestions,
    e.date,
    e.timePerQuestion,
  ].join("|");
}

function dbQuizKey(r: DbQuizResult): string {
  return [
    r.title,
    r.scoreInPercent,
    r.questionCount,
    dbResultDate(r),
    r.timePerQuestion,
  ].join("|");
}

function countQuizPending(): number {
  return useQuizHistoryStore
    .getState()
    .entries.filter((e) => e.synced !== true).length;
}

async function fetchLearnedIds(): Promise<Set<number> | null> {
  try {
    const res = await fetch("/api/v1/words/learned", { cache: "no-store" });
    if (!res.ok) return null;
    const body = (await res.json()) as { success?: boolean; data?: number[] };
    if (!body.success || !Array.isArray(body.data)) return null;
    return new Set(body.data);
  } catch {
    return null;
  }
}

async function fetchBookmarkIds(): Promise<Set<number> | null> {
  try {
    const res = await fetch("/api/v1/words/bookmarks", { cache: "no-store" });
    if (!res.ok) return null;
    const body = (await res.json()) as { success?: boolean; data?: number[] };
    if (!body.success || !Array.isArray(body.data)) return null;
    return new Set(body.data);
  } catch {
    return null;
  }
}

async function pushQuizResult(entry: QuizHistoryEntry): Promise<number | null> {
  const levels = entry.levels.filter((l) => VALID_LEVELS.has(l));
  if (!levels.length) return null;
  const score = quizScore(entry);
  const correct = Math.round((score / 100) * entry.numberOfQuestions);
  const body = {
    clientId: entry.id,
    quizType: CLIENT_TO_DB_QUIZ_TYPE[entry.quizType] ?? "ENGLISH_TO_BANGLA",
    questionCount: entry.numberOfQuestions,
    levels,
    timePerQuestion: entry.timePerQuestion,
    timeTotalQuiz: entry.numberOfQuestions * entry.timePerQuestion,
    scheduleEnabled: false,
    correctAnswers: correct,
    scoreInPercent: score,
    totalScore: correct,
  };
  try {
    const res = await fetch("/api/v1/quiz/results", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) return null;
    const json = (await res.json()) as {
      success?: boolean;
      data?: { id?: number } | null;
    };
    if (!json.success) return null;
    return typeof json.data?.id === "number" ? json.data.id : null;
  } catch {
    return null;
  }
}

async function pushLearned(wordId: number): Promise<boolean> {
  try {
    const res = await fetch(`/api/v1/words/${wordId}/learned`, {
      method: "POST",
    });
    return res.ok;
  } catch {
    return false;
  }
}

async function pushBookmark(wordId: number): Promise<boolean> {
  try {
    const res = await fetch(`/api/v1/words/${wordId}/bookmark`, {
      method: "POST",
    });
    return res.ok || res.status === 409;
  } catch {
    return false;
  }
}

async function syncQuizResults(dbResults: DbQuizResult[]): Promise<{
  ok: number;
  failed: number;
}> {
  const byClientId = new Map<string, DbQuizResult>();
  const byStruct = new Map<string, DbQuizResult>();
  for (const r of dbResults) {
    if (r.clientId) {
      byClientId.set(r.clientId, r);
    } else {
      const k = dbQuizKey(r);
      if (!byStruct.has(k)) byStruct.set(k, r);
    }
  }
  const updateEntry = useQuizHistoryStore.getState().updateEntry;

  for (const e of useQuizHistoryStore.getState().entries) {
    if (e.synced === true) continue;
    if (e.dbId != null && dbResults.some((r) => r.id === e.dbId)) {
      updateEntry(e.id, { synced: true });
      continue;
    }
    const byId = byClientId.get(e.id);
    if (byId) {
      updateEntry(e.id, { synced: true, dbId: byId.id });
      continue;
    }
    const byStructRow = byStruct.get(quizEntryKey(e));
    if (byStructRow) {
      updateEntry(e.id, { synced: true, dbId: byStructRow.id });
    }
  }

  let ok = 0;
  let failed = 0;
  const pending = useQuizHistoryStore
    .getState()
    .entries.filter((e) => e.synced !== true);
  for (const e of pending) {
    const dbId = await pushQuizResult(e);
    if (dbId != null) {
      updateEntry(e.id, { synced: true, dbId });
      ok += 1;
    } else {
      failed += 1;
    }
  }
  return { ok, failed };
}

async function reconcileWordType(
  type: "learned" | "bookmarked",
  scope: string,
  dbIds: Set<number> | null,
  pushFn: (id: number) => Promise<boolean>
): Promise<{ ok: number; failed: number }> {
  if (!dbIds) return { ok: 0, failed: 1 };
  const local = await getWordsByType(type, scope);
  let ok = 0;
  let failed = 0;

  for (const entry of local) {
    const id = Number(entry.id);
    if (Number.isNaN(id)) continue;
    if (entry.synced === true) continue;
    if (dbIds.has(id)) {
      await setWordSynced(scope, type, entry.id, true);
      ok += 1;
      continue;
    }
    const pushed = await pushFn(id);
    if (pushed) {
      await setWordSynced(scope, type, entry.id, true);
      ok += 1;
    } else {
      failed += 1;
    }
  }

  return { ok, failed };
}

async function performSync(scope: string): Promise<void> {
  const [dbResults, dbLearned, dbBookmarks] = await Promise.all([
    fetchQuizResultsFromDb(),
    fetchLearnedIds(),
    fetchBookmarkIds(),
  ]);

  let failed = 0;

  if (dbResults) {
    const r = await syncQuizResults(dbResults);
    failed += r.failed;
  } else {
    failed += 1;
  }

  const learned = await reconcileWordType(
    "learned",
    scope,
    dbLearned,
    pushLearned
  );
  failed += learned.failed;

  const bookmarked = await reconcileWordType(
    "bookmarked",
    scope,
    dbBookmarks,
    pushBookmark
  );
  failed += bookmarked.failed;

  const pendingLearned = (await getWordsByType("learned", scope)).filter(
    (w) => w.synced !== true
  ).length;
  const pendingBookmarked = (await getWordsByType("bookmarked", scope)).filter(
    (w) => w.synced !== true
  ).length;

  useSyncStore.getState().setState({
    status: failed > 0 ? "failed" : "success",
    pendingQuiz: countQuizPending(),
    pendingLearned,
    pendingBookmarked,
    lastSyncedAt: Date.now(),
    lastError: failed > 0 ? `${failed} record(s) failed to sync.` : null,
  });
}

let running = false;

export async function runSync(): Promise<void> {
  if (running) return;
  const { status, userId, path } = useAuthStore.getState();
  if (status !== "google" || !userId) {
    useSyncStore.getState().setState({
      status: "failed",
      pendingQuiz: countQuizPending(),
      lastError: "Sign in to Google to sync your data.",
    });
    return;
  }
  running = true;
  useSyncStore.getState().setState({ status: "syncing", lastError: null });
  try {
    await performSync(path);
  } catch {
    useSyncStore.getState().setState({
      status: "failed",
      lastError: "Sync failed unexpectedly.",
    });
  } finally {
    running = false;
  }
}