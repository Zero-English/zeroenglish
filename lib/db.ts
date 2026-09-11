"use client";

import db from "@/lib/idb";

export type WordListType = "bookmarked" | "learned" | "still-learning";

export interface WordEntry {
  id: string;
  type: WordListType;
  timestamp?: number;
  synced?: boolean;
}

export interface ActivityEntry {
  date: string;
  quizzesDone: number;
  correctAnswers: number;
}

export const ANON_SCOPE = "anon";

function progressKey(scope: string, type: WordListType, id: string): [string, string, string] {
  return [scope, id, type];
}

function toWordEntry(indexed: {
  scope: string;
  wordId: string;
  type: WordListType;
  timestamp: number;
  synced: boolean;
}): WordEntry {
  return {
    id: indexed.wordId,
    type: indexed.type,
    timestamp: indexed.timestamp,
    synced: indexed.synced,
  };
}

export async function putWord(entry: WordEntry, scope: string): Promise<void> {
  const now = Date.now();
  const existing = await db.progress.get(progressKey(scope, entry.type, entry.id));
  const timestamp = entry.timestamp ?? existing?.timestamp ?? now;
  const synced = entry.synced ?? existing?.synced ?? false;
  await db.progress.put({
    scope,
    wordId: entry.id,
    type: entry.type,
    timestamp,
    synced,
  });
}

export async function getWord(
  scope: string,
  type: WordListType,
  id: string
): Promise<WordEntry | undefined> {
  const rec = await db.progress.get(progressKey(scope, type, id));
  return rec ? toWordEntry(rec) : undefined;
}

export async function setWordSynced(
  scope: string,
  type: WordListType,
  id: string,
  synced: boolean
): Promise<void> {
  const existing = await db.progress.get(progressKey(scope, type, id));
  if (!existing) return;
  await db.progress.put({ ...existing, synced });
}

export async function deleteWord(
  scope: string,
  type: WordListType,
  id: string
): Promise<void> {
  await db.progress.delete(progressKey(scope, type, id));
}

export async function bulkPutWords(
  entries: WordEntry[],
  scope: string
): Promise<void> {
  await db.transaction("rw", db.progress, async () => {
    for (const entry of entries) {
      const now = Date.now();
      const needsMerge =
        entry.synced === undefined || entry.timestamp === undefined;
      const existing = needsMerge
        ? await db.progress.get(progressKey(scope, entry.type, entry.id))
        : null;
      await db.progress.put({
        scope,
        wordId: entry.id,
        type: entry.type,
        timestamp: entry.timestamp ?? existing?.timestamp ?? now,
        synced: entry.synced ?? existing?.synced ?? false,
      });
    }
  });
}

export async function getWordsByType(
  type: WordListType,
  scope: string
): Promise<WordEntry[]> {
  const recs = await db.progress
    .where("[scope+type]")
    .equals([scope, type])
    .toArray();
  return recs.map(toWordEntry);
}

export async function getUserPendingByType(
  scope: string,
  type: WordListType
): Promise<WordEntry[]> {
  const recs = await db.progress
    .where("[scope+type]")
    .equals([scope, type])
    .filter((r) => r.synced !== true)
    .toArray();
  return recs.map(toWordEntry);
}

const ACTIVITY_KEY = "voc_activity";

function activityKey(scope: string): string {
  return scope ? `${ACTIVITY_KEY}_${scope}` : ACTIVITY_KEY;
}

function readAllActivity(scope: string): ActivityEntry[] {
  try {
    const raw = localStorage.getItem(activityKey(scope));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as ActivityEntry[]) : [];
  } catch {
    return [];
  }
}

function writeAllActivity(entries: ActivityEntry[], scope: string): void {
  localStorage.setItem(activityKey(scope), JSON.stringify(entries));
}

export async function getActivity(
  date: string,
  scope: string
): Promise<ActivityEntry | undefined> {
  return readAllActivity(scope).find((e) => e.date === date);
}

export async function getAllActivity(scope: string): Promise<ActivityEntry[]> {
  return readAllActivity(scope);
}

export async function incrementQuizzesDone(
  date: string,
  scope: string
): Promise<void> {
  const entries = readAllActivity(scope);
  const existing = entries.find((e) => e.date === date);
  const updated = {
    date,
    quizzesDone: (existing?.quizzesDone ?? 0) + 1,
    correctAnswers: existing?.correctAnswers ?? 0,
  };
  writeAllActivity(
    existing ? entries.map((e) => (e.date === date ? updated : e)) : [...entries, updated],
    scope
  );
}

export async function addCorrectAnswers(
  date: string,
  correctCount: number,
  scope: string
): Promise<void> {
  const entries = readAllActivity(scope);
  const existing = entries.find((e) => e.date === date);
  const updated = {
    date,
    quizzesDone: existing?.quizzesDone ?? 0,
    correctAnswers: (existing?.correctAnswers ?? 0) + correctCount,
  };
  writeAllActivity(
    existing ? entries.map((e) => (e.date === date ? updated : e)) : [...entries, updated],
    scope
  );
}

/**
 * Adopts data written while the user was not signed in (anonymous scope) into
 * the target scope. The `pathScope` is the auth-store path used for per-word
 * keys (e.g. "guest" or "google|5"); the `nsScope` is the identity namespace
 * used for scoped zustand stores (e.g. "guest" or "5"). Existing target data is
 * never overwritten. Word progress is moved inside IndexedDB; quiz activity and
 * identity-scoped zustand stores remain in localStorage.
 */
export async function adoptAnonDataInto(
  pathScope: string,
  nsScope?: string
): Promise<void> {
  const ns = nsScope ?? pathScope;

  const fromEntries = await db.progress.where("scope").equals(ANON_SCOPE).toArray();
  const toEntries = await db.progress.where("scope").equals(pathScope).toArray();
  const existingKeys = new Set(toEntries.map((e) => e.wordId + "|" + e.type));

  for (const entry of fromEntries) {
    if (existingKeys.has(entry.wordId + "|" + entry.type)) continue;
    await db.progress.put({ ...entry, scope: pathScope });
    await db.progress.delete([ANON_SCOPE, entry.wordId, entry.type]);
  }

  const fromActivity = activityKey(ANON_SCOPE);
  const toActivity = activityKey(pathScope);
  const fromRaw = localStorage.getItem(fromActivity);
  if (fromRaw && !localStorage.getItem(toActivity)) {
    localStorage.setItem(toActivity, fromRaw);
  }

  const fromScoped = `zero_english:${ANON_SCOPE}`;
  const toScoped = `zero_english:${ns}`;
  const rawFrom = localStorage.getItem(fromScoped);
  if (!rawFrom) return;
  try {
    const fromObj = JSON.parse(rawFrom) as Record<string, unknown>;
    const rawTo = localStorage.getItem(toScoped);
    const toObj = rawTo ? (JSON.parse(rawTo) as Record<string, unknown>) : {};
    let changed = false;
    for (const [name, value] of Object.entries(fromObj)) {
      if (toObj[name] === undefined && value !== null && value !== undefined) {
        toObj[name] = value;
        changed = true;
      }
    }
    if (changed) localStorage.setItem(toScoped, JSON.stringify(toObj));
  } catch {
    // skip corrupt anon scoped data
  }
}

export function adoptAnonDataIntoGuest(): void {
  void adoptAnonDataInto("guest");
}