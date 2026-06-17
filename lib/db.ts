"use client";

import Dexie, { type EntityTable } from "dexie";

export interface WordEntry {
  id: string;
  type: "bookmarked" | "learned";
}

const db = new Dexie("VocabularyDB") as Dexie & {
  words: EntityTable<WordEntry, "id">;
};

db.version(1).stores({
  words: "id, type",
});

export { db };
