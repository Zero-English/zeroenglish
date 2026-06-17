"use client";

import Dexie, { type EntityTable } from "dexie";

export interface WordEntry {
  id: string;
  type: "bookmarked" | "learned" | "still-learning";
}

const LS_PREFIX = "voc_";

let db: Dexie & { words: EntityTable<WordEntry, "id"> };

try {
  db = new Dexie("VocabularyDB") as Dexie & {
    words: EntityTable<WordEntry, "id">;
  };
  db.version(1).stores({ words: "id, type" });
} catch {
  db = null as unknown as Dexie & { words: EntityTable<WordEntry, "id"> };
}

function readLocalStorage(type: string): WordEntry[] {
  const entries: WordEntry[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(LS_PREFIX)) {
      try {
        const raw = localStorage.getItem(key);
        if (raw) {
          const entry = JSON.parse(raw) as WordEntry;
          if (entry.type === type) entries.push(entry);
        }
      } catch {
        // skip corrupt entry
      }
    }
  }
  return entries;
}

export async function putWord(entry: WordEntry): Promise<void> {
  if (db) {
    try {
      await db.words.put(entry);
    } catch (err) {
      console.error("Dexie put failed:", err);
    }
  }
  localStorage.setItem(LS_PREFIX + entry.id, JSON.stringify(entry));
}

export async function deleteWord(id: string): Promise<void> {
  if (db) {
    try {
      await db.words.delete(id);
    } catch (err) {
      console.error("Dexie delete failed:", err);
    }
  }
  localStorage.removeItem(LS_PREFIX + id);
}

export async function bulkPutWords(entries: WordEntry[]): Promise<void> {
  if (db) {
    try {
      await db.words.bulkPut(entries);
    } catch (err) {
      console.error("Dexie bulkPut failed:", err);
    }
  }
  for (const entry of entries) {
    localStorage.setItem(LS_PREFIX + entry.id, JSON.stringify(entry));
  }
}

export async function getWordsByType(type: string): Promise<WordEntry[]> {
  if (db) {
    try {
      return await db.words.where("type").equals(type).toArray();
    } catch (err) {
      console.error("Dexie getWordsByType failed, reading from localStorage:", err);
    }
  }
  return readLocalStorage(type);
}
