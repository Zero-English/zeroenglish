"use client";

import Dexie, { type EntityTable, type Table } from "dexie";
import type { Word } from "@/lib/data";
import type { ActivityEntry } from "@/lib/db";

export interface ProgressEntry {
  scope: string;
  wordId: string;
  type: "learned" | "bookmarked" | "still-learning";
  timestamp: number;
  synced: boolean;
  /**
   * True when the local copy represents a removal that has not reached the
   * server yet (a "tombstone"). Active lists exclude these rows; the sync
   * pass fires the DELETE and drops the row.
   */
  deleted?: boolean;
}

export interface ActivityRow extends ActivityEntry {
  scope: string;
}

export interface QuizHistoryRow {
  scope: string;
  id: string;
  quizType: string;
  date: string;
  win: string;
  levels: string[];
  numberOfQuestions: number;
  timePerQuestion: number;
  synced: boolean;
  dbId?: number | null;
  createdAt?: number;
}

export interface MetaEntry {
  key: string;
  value: unknown;
}

const LEGACY_GOOGLE_PREFIX = "google|";
const GOOGLE_SCOPE_PREFIX = "google:";

function scopeFromLegacy(scope: string): string {
  return scope.startsWith(LEGACY_GOOGLE_PREFIX)
    ? `google:${scope.slice(LEGACY_GOOGLE_PREFIX.length)}`
    : scope;
}

const db = new Dexie("ZeroEnglishDB") as Dexie & {
  words: EntityTable<Word, "id">;
  progress: Table<ProgressEntry, [string, string, string]>;
  activity: Table<ActivityRow, [string, string]>;
  quizHistory: Table<QuizHistoryRow, [string, string]>;
  metadata: EntityTable<MetaEntry, "key">;
};

db.version(1).stores({
  words: "id, word, level, category",
  progress: "[scope+wordId+type], [scope+type], scope, synced",
  metadata: "key",
});

db.version(2)
  .stores({
    words: "id, word, level, category",
    progress: "[scope+wordId+type], [scope+type], scope, synced",
    activity: "[scope+date], scope",
    metadata: "key",
  })
  .upgrade(async (tx) => {
    const localStorageKeys: string[] = [];
    try {
      for (let i = 0; i < window.localStorage.length; i++) {
        localStorageKeys.push(window.localStorage.key(i) ?? "");
      }
    } catch {
      // localStorage unavailable (private mode etc.)
    }

    const ACTIVITY_KEY_PREFIX = "voc_activity_";

    await tx
      .table("progress")
      .toCollection()
      .modify((rec: ProgressEntry) => {
        if (rec.scope.startsWith(LEGACY_GOOGLE_PREFIX)) {
          rec.scope = scopeFromLegacy(rec.scope);
        }
      });

    const migrations: Promise<void>[] = [];

    for (const key of localStorageKeys) {
      if (!key.startsWith(ACTIVITY_KEY_PREFIX)) continue;
      const rawScope = key.slice(ACTIVITY_KEY_PREFIX.length);
      if (!rawScope || rawScope.startsWith("google:")) continue;
      const scope = scopeFromLegacy(rawScope);
      let entries: ActivityEntry[] = [];
      try {
        const raw = window.localStorage.getItem(key);
        if (raw) entries = JSON.parse(raw) as ActivityEntry[];
      } catch {
        entries = [];
      }
      if (entries.length > 0) {
        migrations.push(
          tx
            .table("activity")
            .bulkPut(entries.map((e) => ({ ...e, scope })))
        );
      }
      try {
        window.localStorage.removeItem(key);
      } catch {
        // ignore removal failures
      }
    }

    await Promise.all(migrations);
  });

function scopeFromNamespace(ns: string): string {
  if (ns === "guest" || ns === "anon") return ns;
  return `${GOOGLE_SCOPE_PREFIX}${ns}`;
}

/**
 * v3: adds the identity-scoped quizHistory table (practice quiz results) and
 * migrates every persisted quiz-history zustand entry (from the legacy global
 * key and from each zero_english:{ns} scoped bucket) into IndexedDB.
 */
db.version(3)
  .stores({
    words: "id, word, level, category",
    progress: "[scope+wordId+type], [scope+type], scope, synced",
    activity: "[scope+date], scope",
    quizHistory: "[scope+id], scope, synced",
    metadata: "key",
  })
  .upgrade(async (tx) => {
    const localStorageKeys: string[] = [];
    try {
      for (let i = 0; i < window.localStorage.length; i++) {
        localStorageKeys.push(window.localStorage.key(i) ?? "");
      }
    } catch {
      // localStorage unavailable (private mode etc.)
    }

    interface RawEntry {
      id: string;
      quizType: string;
      date: string;
      win: string;
      levels: string[];
      numberOfQuestions: number;
      timePerQuestion: number;
      synced?: boolean;
      dbId?: number | null;
      createdAt?: number;
    }

    const rows: QuizHistoryRow[] = [];
    const keysToClean: string[] = [];

    const collectEntries = (entries: RawEntry[], scope: string) => {
      for (const e of entries) {
        if (!e || typeof e.id !== "string") continue;
        rows.push({
          scope,
          id: e.id,
          quizType: e.quizType,
          date: e.date,
          win: e.win,
          levels: Array.isArray(e.levels) ? e.levels : [],
          numberOfQuestions: e.numberOfQuestions,
          timePerQuestion: e.timePerQuestion,
          synced: e.synced === true,
          dbId: e.dbId ?? null,
          createdAt: e.createdAt,
        });
      }
    };

    // Legacy global key (pre-namespace).
    const legacyRaw = window.localStorage.getItem("quiz-history");
    if (legacyRaw) {
      try {
        const parsed = JSON.parse(legacyRaw) as { state?: { entries?: RawEntry[] } };
        if (Array.isArray(parsed.state?.entries)) {
          collectEntries(parsed.state.entries, "anon");
        }
      } catch {
        // ignore corrupt data
      }
      keysToClean.push("quiz-history");
    }

    // Per-identity scoped buckets: zero_english:{ns} -> { [storeName]: {state,version} }.
    for (const key of localStorageKeys) {
      if (!key.startsWith("zero_english:")) continue;
      const ns = key.slice("zero_english:".length);
      if (!ns) continue;
      try {
        const raw = window.localStorage.getItem(key);
        if (!raw) continue;
        const bucket = JSON.parse(raw) as Record<string, unknown>;
        const quizStore = bucket["quiz-history"] as {
          state?: { entries?: RawEntry[] };
        } | undefined;
        if (quizStore && Array.isArray(quizStore.state?.entries)) {
          collectEntries(quizStore.state.entries, scopeFromNamespace(ns));
        }
        const hasQuizStore = bucket["quiz-history"] !== undefined;
        if (hasQuizStore) {
          delete bucket["quiz-history"];
          if (Object.keys(bucket).length === 0) {
            keysToClean.push(key);
          } else {
            window.localStorage.setItem(key, JSON.stringify(bucket));
          }
        }
      } catch {
        // ignore corrupt scoped bucket
      }
    }

    for (const key of keysToClean) {
      try {
        window.localStorage.removeItem(key);
      } catch {
        // ignore removal failures
      }
    }

    if (rows.length > 0) {
      // The migration only ever sees local data, so a re-run never happens for
      // rows already present (a fresh upgrade starts from an empty table when
      // idempotency could not hold, overwriting identical rows is harmless).
      await tx.table("quizHistory").bulkPut(rows);
    }
  });

export default db;