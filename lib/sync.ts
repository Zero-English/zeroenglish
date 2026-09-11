"use client";

import { create } from "zustand";
import { useAuthStore } from "@/lib/auth-store";
import {
  getWordsByType,
  getUserPendingByType,
  getPendingDeletesByType,
  setWordSynced,
  deleteWord,
  bulkPutWords,
  type WordListType,
} from "@/lib/db";
import {
  fetchQuizResultsFromDb,
  dbResultDate,
  type DbQuizResult,
} from "@/lib/quiz-results-api";
import type { QuizHistoryEntry } from "@/lib/quiz-history-store";
import {
  getQuizHistoryPending,
  updateQuizHistoryEntry,
} from "@/lib/use-quiz-history";

export type SyncStatus = "idle" | "syncing" | "success" | "failed";

export interface SyncState {
  status: SyncStatus;
  pendingQuiz: number;
  pendingLearned: number;
  pendingBookmarked: number;
  pendingStillLearning: number;
  lastSyncedAt: number | null;
  lastError: string | null;
  setState: (patch: Partial<SyncState>) => void;
}

export const useSyncStore = create<SyncState>()((set) => ({
  status: "idle",
  pendingQuiz: 0,
  pendingLearned: 0,
  pendingBookmarked: 0,
  pendingStillLearning: 0,
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

/** Recomputes the pending counts shown by the sync badge (adds + tombstones). */
export async function refreshPending(): Promise<void> {
  const { status, path } = useAuthStore.getState();
  if (status !== "google") return;

  const [quiz, learned, bookmarked, still, delLearned, delBookmarked, delStill] =
    await Promise.all([
      getQuizHistoryPending(path),
      getUserPendingByType(path, "learned"),
      getUserPendingByType(path, "bookmarked"),
      getUserPendingByType(path, "still-learning"),
      getPendingDeletesByType(path, "learned"),
      getPendingDeletesByType(path, "bookmarked"),
      getPendingDeletesByType(path, "still-learning"),
    ]);

  useSyncStore.getState().setState({
    pendingQuiz: quiz.length,
    pendingLearned: learned.length + delLearned.length,
    pendingBookmarked: bookmarked.length + delBookmarked.length,
    pendingStillLearning: still.length + delStill.length,
  });
}

async function fetchIds(url: string): Promise<Set<number> | null> {
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    const body = (await res.json()) as { success?: boolean; data?: number[] };
    if (!body.success || !Array.isArray(body.data)) return null;
    return new Set(body.data);
  } catch {
    return null;
  }
}

async function pushBulk(url: string, wordIds: number[]): Promise<boolean> {
  if (wordIds.length === 0) return true;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ wordIds }),
    });
    return res.ok || res.status === 409;
  } catch {
    return false;
  }
}

export async function pushLearnedBulk(wordIds: number[]): Promise<boolean> {
  return pushBulk("/api/v1/words/learned", wordIds);
}

export async function pushBookmarkBulk(wordIds: number[]): Promise<boolean> {
  return pushBulk("/api/v1/words/bookmarks", wordIds);
}

export async function pushStillLearningBulk(wordIds: number[]): Promise<boolean> {
  return pushBulk("/api/v1/words/still-learning", wordIds);
}

const WORD_TYPE_PUSH_FN: Record<WordListType, (ids: number[]) => Promise<boolean>> = {
  learned: pushLearnedBulk,
  bookmarked: pushBookmarkBulk,
  "still-learning": pushStillLearningBulk,
};

function wordDeleteUrl(type: WordListType, id: string): string {
  const segment =
    type === "learned"
      ? "learned"
      : type === "bookmarked"
        ? "bookmark"
        : "still-learning";
  return `/api/v1/words/${id}/${segment}`;
}

async function deleteRemoteWord(type: WordListType, id: string): Promise<boolean> {
  try {
    const res = await fetch(wordDeleteUrl(type, id), { method: "DELETE" });
    return res.ok || res.status === 404 || res.status === 409;
  } catch {
    return false;
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

async function syncQuizResults(
  scope: string,
  dbResults: DbQuizResult[]
): Promise<number> {
  if (!Array.isArray(dbResults)) dbResults = [];
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

  let failed = 0;
  const pending = await getQuizHistoryPending(scope);
  for (const e of pending) {
    if (e.dbId != null && dbResults.some((r) => r.id === e.dbId)) {
      await updateQuizHistoryEntry(scope, e.id, { synced: true });
      continue;
    }
    const byId = byClientId.get(e.id);
    if (byId) {
      await updateQuizHistoryEntry(scope, e.id, { synced: true, dbId: byId.id });
      continue;
    }
    const byStructRow = byStruct.get(quizEntryKey(e));
    if (byStructRow) {
      await updateQuizHistoryEntry(scope, e.id, {
        synced: true,
        dbId: byStructRow.id,
      });
      continue;
    }
    const dbId = await pushQuizResult(e);
    if (dbId != null) {
      await updateQuizHistoryEntry(scope, e.id, { synced: true, dbId });
    } else {
      failed += 1;
    }
  }
  return failed;
}

/**
 * Reconcilies one word list in both directions:
 *  1. local adds already on the server -> marked synced.
 *  2. server rows the device has never seen -> pulled locally as synced.
 *  3. local unsynced adds -> pushed in bulk POSTs (one request per 500).
 *  4. local removals (tombstones) -> per-word DELETEs, dropped on success.
 */
async function reconcileType(
  type: WordListType,
  scope: string,
  dbIds: Set<number> | null
): Promise<{ ok: number; failed: number }> {
  if (!dbIds) return { ok: 0, failed: 1 };
  let ok = 0;
  let failed = 0;

  const active = await getWordsByType(type, scope);
  for (const entry of active) {
    const id = Number(entry.id);
    if (Number.isNaN(id)) continue;
    if (entry.synced !== true && dbIds.has(id)) {
      await setWordSynced(scope, type, entry.id, true);
      ok += 1;
    }
  }

  const localKeys = new Set(active.map((e) => e.id));
  const dbOnly = Array.from(dbIds)
    .map(String)
    .filter((id) => !localKeys.has(id));
  if (dbOnly.length > 0) {
    await bulkPutWords(
      dbOnly.map((id) => ({ id, type, synced: true })),
      scope
    );
  }

  const pushFn = WORD_TYPE_PUSH_FN[type];
  const pending = (await getUserPendingByType(scope, type)).filter((w) => {
    const n = Number(w.id);
    return !Number.isNaN(n) && !dbIds.has(n);
  });
  if (pending.length > 0) {
    const chunks: number[][] = [];
    for (let i = 0; i < pending.length; i += 500) {
      chunks.push(pending.slice(i, i + 500).map((w) => Number(w.id)));
    }
    for (const chunk of chunks) {
      const pushed = await pushFn(chunk);
      if (pushed) {
        for (const w of pending) {
          if (chunk.includes(Number(w.id))) {
            await setWordSynced(scope, type, w.id, true);
            ok += 1;
          }
        }
      } else {
        failed += chunk.length;
      }
    }
  }

  const removed = await getPendingDeletesByType(scope, type);
  for (const rec of removed) {
    const id = Number(rec.id);
    if (Number.isNaN(id)) continue;
    // Only contact the server for words it actually owns for this user (per
    // the id set fetched this run). Stale/guest-migrated tombstones for words
    // the server has never seen can simply be dropped locally — firing a
    // DELETE for them would only produce a 404.
    if (!dbIds.has(id)) {
      await deleteWord(scope, type, rec.id);
      ok += 1;
      continue;
    }
    const okRemote = await deleteRemoteWord(type, rec.id);
    if (okRemote) {
      await deleteWord(scope, type, rec.id);
      ok += 1;
    } else {
      failed += 1;
    }
  }

  return { ok, failed };
}

async function performSync(scope: string): Promise<void> {
  const [dbResults, dbLearned, dbBookmarks, dbStill] = await Promise.all([
    fetchQuizResultsFromDb(),
    fetchIds("/api/v1/words/learned"),
    fetchIds("/api/v1/words/bookmarks"),
    fetchIds("/api/v1/words/still-learning"),
  ]);

  let failed = 0;

  if (dbResults) {
    failed += await syncQuizResults(scope, dbResults);
  } else {
    failed += 1;
  }

  for (const type of ["learned", "bookmarked", "still-learning"] as const) {
    const dbIds =
      type === "learned" ? dbLearned : type === "bookmarked" ? dbBookmarks : dbStill;
    const r = await reconcileType(type, scope, dbIds);
    failed += r.failed;
  }

  const [pendingQuiz, pendingLearned, pendingBookmarked, pendingStill] =
    await Promise.all([
      getQuizHistoryPending(scope),
      getUserPendingByType(scope, "learned"),
      getUserPendingByType(scope, "bookmarked"),
      getUserPendingByType(scope, "still-learning"),
    ]);
  const [delLearned, delBookmarked, delStill] = await Promise.all([
    getPendingDeletesByType(scope, "learned"),
    getPendingDeletesByType(scope, "bookmarked"),
    getPendingDeletesByType(scope, "still-learning"),
  ]);

  useSyncStore.getState().setState({
    status: failed > 0 ? "failed" : "success",
    pendingQuiz: pendingQuiz.length,
    pendingLearned: pendingLearned.length + delLearned.length,
    pendingBookmarked: pendingBookmarked.length + delBookmarked.length,
    pendingStillLearning: pendingStill.length + delStill.length,
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