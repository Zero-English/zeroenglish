"use client";

import Dexie, { type EntityTable, type Table } from "dexie";
import type { Word } from "@/lib/data";

export interface ProgressEntry {
  scope: string;
  wordId: string;
  type: "learned" | "bookmarked" | "still-learning";
  timestamp: number;
  synced: boolean;
}

export interface MetaEntry {
  key: string;
  value: unknown;
}

const db = new Dexie("ZeroEnglishDB") as Dexie & {
  words: EntityTable<Word, "id">;
  progress: Table<ProgressEntry, [string, string, string]>;
  metadata: EntityTable<MetaEntry, "key">;
};

db.version(1).stores({
  words: "id, word, level, category",
  progress: "[scope+wordId+type], [scope+type], scope, synced",
  metadata: "key",
});

export default db;