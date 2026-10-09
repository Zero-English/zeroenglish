"use client";

import db from "@/lib/idb";

export type WordListType = "bookmarked" | "learned" | "still-learning";

export interface WordEntry {
  id: string;
  type: WordListType;
  timestamp?: number;
  synced?: boolean;
  deleted?: boolean;
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
  deleted?: boolean;
}): WordEntry {
  return {
    id: indexed.wordId,
    type: indexed.type,
    timestamp: indexed.timestamp,
    synced: indexed.synced,
    deleted: indexed.deleted,
  };
}

export async function putWord(entry: WordEntry, scope: string): Promise<void> {
  const now = Date.now();
  const existing = await db.progress.get(progressKey(scope, entry.type, entry.id));
  const timestamp = entry.timestamp ?? existing?.timestamp ?? now;
  const synced = entry.synced ?? existing?.synced ?? false;
  const deleted = entry.deleted ?? existing?.deleted ?? false;
  await db.progress.put({
    scope,
    wordId: entry.id,
    type: entry.type,
    timestamp,
    synced,
    deleted,
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

/**
 * Records a removal that is pending a server DELETE. A synced row becomes a
 * tombstone (`deleted: true, synced: false`) so later toggles can revive it to
 * net-zero; an already-unsynced row is simply dropped.
 */
export async function setWordRemoved(
  scope: string,
  type: WordListType,
  id: string
): Promise<void> {
  const existing = await db.progress.get(progressKey(scope, type, id));
  if (!existing) return;
  await db.progress.put({
    ...existing,
    synced: false,
    deleted: true,
  });
}

/** Re-adds a word that had been removed (revives a tombstone). */
export async function reviveWord(
  scope: string,
  type: WordListType,
  id: string
): Promise<void> {
  const existing = await db.progress.get(progressKey(scope, type, id));
  if (!existing) return;
  await db.progress.put({ ...existing, deleted: false });
}

export async function getPendingDeletesByType(
  scope: string,
  type: WordListType
): Promise<WordEntry[]> {
  const recs = await db.progress
    .where("[scope+type]")
    .equals([scope, type])
    .filter((r) => r.deleted === true)
    .toArray();
  return recs.map(toWordEntry);
}

/** Wipes every locally stored piece of a profile scope (words, activity, quiz history). */
export async function clearProfileData(scope: string): Promise<void> {
  await db.transaction(
    "rw",
    db.progress,
    db.activity,
    db.quizHistory,
    async () => {
      await db.progress.where("scope").equals(scope).delete();
      await db.activity.where("scope").equals(scope).delete();
      await db.quizHistory.where("scope").equals(scope).delete();
    }
  );
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
        deleted: entry.deleted ?? existing?.deleted ?? false,
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
    .filter((r) => r.deleted !== true)
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
    .filter((r) => r.synced !== true && r.deleted !== true)
    .toArray();
  return recs.map(toWordEntry);
}

export async function getActivity(
  date: string,
  scope: string
): Promise<ActivityEntry | undefined> {
  return db.activity.get([scope, date]);
}

export async function getAllActivity(scope: string): Promise<ActivityEntry[]> {
  return db.activity.where("scope").equals(scope).toArray();
}

export async function incrementQuizzesDone(
  date: string,
  scope: string
): Promise<void> {
  await db.transaction("rw", db.activity, async () => {
    const existing = await db.activity.get([scope, date]);
    await db.activity.put({
      scope,
      date,
      quizzesDone: (existing?.quizzesDone ?? 0) + 1,
      correctAnswers: existing?.correctAnswers ?? 0,
    });
  });
}

export async function addCorrectAnswers(
  date: string,
  correctCount: number,
  scope: string
): Promise<void> {
  await db.transaction("rw", db.activity, async () => {
    const existing = await db.activity.get([scope, date]);
    await db.activity.put({
      scope,
      date,
      quizzesDone: existing?.quizzesDone ?? 0,
      correctAnswers: (existing?.correctAnswers ?? 0) + correctCount,
    });
  });
}

/**
 * Moves the identity-scoped zustand state from one namespace to another
 * (localStorage keys `zero_english:{fromNs}` vs `zero_english:{toNs}`), never
 * overwriting existing target values.
 */
function adoptScopedLocalStorage(fromNs: string, toNs: string): void {
  if (fromNs === toNs) return;
  if (typeof window === "undefined") return;
  const fromScoped = `zero_english:${fromNs}`;
  const toScoped = `zero_english:${toNs}`;
  const rawFrom = window.localStorage.getItem(fromScoped);
  if (!rawFrom) return;
  try {
    const fromObj = JSON.parse(rawFrom) as Record<string, unknown>;
    const rawTo = window.localStorage.getItem(toScoped);
    const toObj = rawTo ? (JSON.parse(rawTo) as Record<string, unknown>) : {};
    let changed = false;
    for (const [name, value] of Object.entries(fromObj)) {
      if (toObj[name] === undefined && value !== null && value !== undefined) {
        toObj[name] = value;
        changed = true;
      }
    }
    if (changed) window.localStorage.setItem(toScoped, JSON.stringify(toObj));
  } catch {
    // skip corrupt scoped data
  }
}

/**
 * Moves every piece of a profile scope (word progress incl. tombstones, quiz
 * activity, practice quiz history, and the scoped localStorage stores) from one
 * scope into another, never overwriting existing target rows. Migrated word and
 * quiz rows are forced to `synced: false` so the next sync pass guarantees
 * they reach the server subscribed as the destination identity.
 */
export async function migrateProfileData(
  fromScope: string,
  toScope: string,
  ns?: string
): Promise<void> {
  if (fromScope === toScope) return;

  await db.transaction(
    "rw",
    db.progress,
    db.activity,
    db.quizHistory,
    async () => {
      const [fromProgress, toProgress] = await Promise.all([
        db.progress.where("scope").equals(fromScope).toArray(),
        db.progress.where("scope").equals(toScope).toArray(),
      ]);
      const existingProgress = new Set(
        toProgress.map((e) => e.wordId + "|" + e.type)
      );
      for (const entry of fromProgress) {
        if (existingProgress.has(entry.wordId + "|" + entry.type)) continue;
        await db.progress.put({ ...entry, scope: toScope, synced: false });
        await db.progress.delete([fromScope, entry.wordId, entry.type]);
      }

      const [fromActivity, toActivity] = await Promise.all([
        db.activity.where("scope").equals(fromScope).toArray(),
        db.activity.where("scope").equals(toScope).toArray(),
      ]);
      const toDates = new Set(toActivity.map((row) => row.date));
      for (const row of fromActivity) {
        if (toDates.has(row.date)) continue;
        await db.activity.put({ ...row, scope: toScope });
        await db.activity.delete([fromScope, row.date]);
      }

      const [fromQuiz, toQuiz] = await Promise.all([
        db.quizHistory.where("scope").equals(fromScope).toArray(),
        db.quizHistory.where("scope").equals(toScope).toArray(),
      ]);
      const toQuizIds = new Set(toQuiz.map((row) => row.id));
      for (const row of fromQuiz) {
        if (toQuizIds.has(row.id)) continue;
        await db.quizHistory.put({ ...row, scope: toScope, synced: false });
        await db.quizHistory.delete([fromScope, row.id]);
      }
    }
  );

  adoptScopedLocalStorage(ns ?? fromScope, ns ?? toScope);
}

/**
 * Adopts data written while the user was not signed in (anonymous scope) into
 * the target scope. The `pathScope` is the auth-store path used for per-word
 * keys (e.g. "guest" or "google:5"); the `nsScope` is the identity namespace
 * used for scoped zustand stores (e.g. "guest" or "5"). Existing target data is
 * never overwritten.
 */
export async function adoptAnonDataInto(
  pathScope: string,
  nsScope?: string
): Promise<void> {
  await migrateProfileData(ANON_SCOPE, pathScope, nsScope ?? pathScope);
}

export function adoptAnonDataIntoGuest(): void {
  void adoptAnonDataInto("guest");
}