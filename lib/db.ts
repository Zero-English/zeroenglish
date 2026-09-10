"use client";

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

const LS_PREFIX = "voc_";
const ACTIVITY_KEY = "voc_activity";

function wordKey(scope: string, type: WordListType, id: string): string {
  return `${LS_PREFIX}${scope}/${type}|${id}`;
}

function activityKey(scope: string): string {
  return scope ? `${ACTIVITY_KEY}_${scope}` : ACTIVITY_KEY;
}

function migrateLegacyPerWordKeys(type: WordListType, scope: string): void {
  const scopedPrefix = `${LS_PREFIX}${scope}/`;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key || !key.startsWith(LS_PREFIX) || key.startsWith(scopedPrefix)) continue;
    if (key.slice(LS_PREFIX.length).includes("/")) continue;
    try {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const entry = JSON.parse(raw) as WordEntry;
      if (entry.type !== type) continue;
      const parts = entry.id.split("|");
      const numericId =
        parts[1] && Number.isFinite(Number(parts[1])) ? parts[1] : parts[0];
      localStorage.setItem(
        wordKey(scope, type, numericId),
        JSON.stringify({ ...entry, id: numericId })
      );
      localStorage.removeItem(key);
    } catch {
      // skip corrupt entry
    }
  }
}

function readWordsByType(type: WordListType, scope: string): WordEntry[] {
  migrateLegacyPerWordKeys(type, scope);
  const prefix = `${LS_PREFIX}${scope}/`;
  const entries: WordEntry[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key || !key.startsWith(prefix)) continue;
    try {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const entry = JSON.parse(raw) as WordEntry;
      if (entry.type === type) entries.push(entry);
    } catch {
      // skip corrupt entry
    }
  }
  return entries;
}

function readAllActivity(scope: string): ActivityEntry[] {
  const key = activityKey(scope);
  if (scope) {
    const legacyRaw = localStorage.getItem(ACTIVITY_KEY);
    if (legacyRaw && !localStorage.getItem(key)) {
      localStorage.setItem(key, legacyRaw);
      localStorage.removeItem(ACTIVITY_KEY);
    }
  }
  try {
    const raw = localStorage.getItem(key);
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

export async function putWord(entry: WordEntry, scope: string): Promise<void> {
  const enriched = {
    ...entry,
    timestamp: entry.timestamp ?? Date.now(),
    synced: entry.synced ?? false,
  };
  localStorage.setItem(
    wordKey(scope, entry.type, entry.id),
    JSON.stringify(enriched)
  );
}

export async function setWordSynced(
  scope: string,
  type: WordListType,
  id: string,
  synced: boolean
): Promise<void> {
  const key = wordKey(scope, type, id);
  const raw = localStorage.getItem(key);
  if (!raw) return;
  try {
    const entry = JSON.parse(raw) as WordEntry;
    localStorage.setItem(key, JSON.stringify({ ...entry, synced }));
  } catch {
    // skip corrupt entry
  }
}

export async function deleteWord(
  scope: string,
  type: WordListType,
  id: string
): Promise<void> {
  localStorage.removeItem(wordKey(scope, type, id));
}

export async function bulkPutWords(
  entries: WordEntry[],
  scope: string
): Promise<void> {
  const enriched = entries.map((e) => ({
    ...e,
    timestamp: e.timestamp ?? Date.now(),
    synced: e.synced ?? false,
  }));
  for (const entry of enriched) {
    localStorage.setItem(wordKey(scope, entry.type, entry.id), JSON.stringify(entry));
  }
}

export async function getWordsByType(
  type: WordListType,
  scope: string
): Promise<WordEntry[]> {
  return readWordsByType(type, scope);
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
 * Adopts data written while the user was not signed in (anonymous scope,
 * "anon") into the target scope. The `pathScope` is the auth-store path used
 * for per-word and per-activity localStorage keys (e.g. "guest" or
 * "google|5"); the `nsScope` is the identity namespace used for scoped zustand
 * stores (e.g. "guest" or "5"). Called when a user explicitly continues as
 * guest or signs in with Google directly, so progress made before signing in
 * is not orphaned inside a scope the UI never reads again. Existing target
 * data is never overwritten.
 */
export function adoptAnonDataInto(pathScope: string, nsScope?: string): void {
  const FROM = "anon";
  const ns = nsScope ?? pathScope;
  const wordPrefix = `${LS_PREFIX}${FROM}/`;
  const toPrefix = `${LS_PREFIX}${pathScope}/`;

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key || !key.startsWith(wordPrefix)) continue;
    const targetKey = key.replace(wordPrefix, toPrefix);
    if (localStorage.getItem(targetKey)) continue;
    const raw = localStorage.getItem(key);
    if (raw !== null) localStorage.setItem(targetKey, raw);
  }

  const fromActivity = activityKey(FROM);
  const toActivity = activityKey(pathScope);
  const fromRaw = localStorage.getItem(fromActivity);
  if (fromRaw && !localStorage.getItem(toActivity)) {
    localStorage.setItem(toActivity, fromRaw);
  }

  const fromScoped = `zero_english:${FROM}`;
  const toScoped = `zero_english:${ns}`;
  const rawFrom = localStorage.getItem(fromScoped);
  if (!rawFrom) return;
  try {
    const fromObj = JSON.parse(rawFrom) as Record<string, unknown>;
    const rawTo = localStorage.getItem(toScoped);
    const toObj = rawTo
      ? (JSON.parse(rawTo) as Record<string, unknown>)
      : {};
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
  adoptAnonDataInto("guest");
}