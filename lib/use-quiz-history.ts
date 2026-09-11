"use client";

import { useEffect, useSyncExternalStore } from "react";
import db from "./idb";
import type { QuizHistoryRow } from "./idb";
import type { QuizHistoryEntry } from "./quiz-history-store";
import { useAuthPath } from "./auth-store";

/**
 * Identity-scoped practice quiz history, backed by the IndexedDB `quizHistory`
 * table. Reads are local-first; nothing hits the server until the profile sync
 * pass (`lib/sync.ts`) pushes pending entries and marks them synced.
 */

export type { QuizHistoryEntry };

function key(scope: string, id: string): [string, string] {
  return [scope, id];
}

function toEntry(row: QuizHistoryRow): QuizHistoryEntry {
  return {
    id: row.id,
    quizType: row.quizType as QuizHistoryEntry["quizType"],
    date: row.date,
    win: row.win,
    levels: row.levels,
    numberOfQuestions: row.numberOfQuestions,
    timePerQuestion: row.timePerQuestion,
    synced: row.synced,
    dbId: row.dbId,
    createdAt: row.createdAt,
  };
}

export async function getQuizHistory(scope: string): Promise<QuizHistoryEntry[]> {
  const rows = await db.quizHistory.where("scope").equals(scope).toArray();
  return rows.map(toEntry);
}

export async function getQuizHistoryPending(
  scope: string
): Promise<QuizHistoryEntry[]> {
  const rows = await db.quizHistory
    .where("scope")
    .equals(scope)
    .filter((r) => r.synced !== true)
    .toArray();
  return rows.map(toEntry);
}

/** Keeps the module snapshot in sync with direct DB writes for the loaded scope. */
async function touchScope(scope: string): Promise<void> {
  if (loadedKey !== scope || !snapshot.loaded) return;
  try {
    const entries = await getQuizHistory(scope);
    snapshot = { entries, loaded: true };
  } catch {
    // keep the previous snapshot on read errors
  }
  emitChange();
}

export async function putQuizHistoryEntry(
  scope: string,
  entry: QuizHistoryEntry
): Promise<void> {
  const existing = await db.quizHistory.get(key(scope, entry.id));
  await db.quizHistory.put({
    scope,
    id: entry.id,
    quizType: entry.quizType,
    date: entry.date,
    win: entry.win,
    levels: entry.levels,
    numberOfQuestions: entry.numberOfQuestions,
    timePerQuestion: entry.timePerQuestion,
    synced: entry.synced ?? existing?.synced ?? false,
    dbId: entry.dbId ?? existing?.dbId ?? null,
    createdAt: entry.createdAt ?? existing?.createdAt,
  });
  await touchScope(scope);
}

export async function updateQuizHistoryEntry(
  scope: string,
  id: string,
  patch: Partial<Pick<QuizHistoryEntry, "synced" | "dbId">>
): Promise<void> {
  const existing = await db.quizHistory.get(key(scope, id));
  if (!existing) return;
  await db.quizHistory.put({
    ...existing,
    synced: patch.synced ?? existing.synced,
    dbId: patch.dbId !== undefined ? patch.dbId : existing.dbId,
  });
  await touchScope(scope);
}

export async function removeQuizHistoryEntry(scope: string, id: string): Promise<void> {
  await db.quizHistory.delete(key(scope, id));
  await touchScope(scope);
}

export async function clearQuizHistory(scope: string): Promise<void> {
  await db.quizHistory.where("scope").equals(scope).delete();
  await touchScope(scope);
}

interface QuizHistorySnapshot {
  entries: QuizHistoryEntry[];
  loaded: boolean;
}

const EMPTY_SNAPSHOT: QuizHistorySnapshot = { entries: [], loaded: false };

let snapshot: QuizHistorySnapshot = EMPTY_SNAPSHOT;
const listeners = new Set<() => void>();
let currentLoad: Promise<void> | null = null;
let currentLoadKey: string | null = null;
let loadedKey: string | null = null;

function emitChange() {
  for (const listener of listeners) listener();
}

async function doLoad(path: string): Promise<void> {
  try {
    const entries = await getQuizHistory(path);
    snapshot = { entries, loaded: true };
  } catch (err) {
    console.error("Failed to load quiz history:", err);
    snapshot = { ...snapshot, loaded: true };
  }
}

function loadQuizHistory(path: string): Promise<void> {
  if (currentLoad && currentLoadKey === path) return currentLoad;
  if (loadedKey === path && snapshot.loaded) return Promise.resolve();
  currentLoadKey = path;
  currentLoad = doLoad(path).finally(() => {
    loadedKey = currentLoadKey;
    currentLoad = null;
    currentLoadKey = null;
    emitChange();
  });
  return currentLoad;
}

/**
 * React binding for the current identity's practice quiz history. The module
 * snapshot mirrors the active auth path, so switching identities swaps the
 * list automatically.
 */
export function useQuizHistory() {
  const { path, hydrated } = useAuthPath();

  useEffect(() => {
    if (hydrated) void loadQuizHistory(path);
  }, [path, hydrated]);

  return useSyncExternalStore(
    (onStoreChange) => {
      listeners.add(onStoreChange);
      return () => {
        listeners.delete(onStoreChange);
      };
    },
    () => snapshot,
    () => EMPTY_SNAPSHOT
  );
}