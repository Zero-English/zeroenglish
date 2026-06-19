"use client";

import Dexie, { type EntityTable } from "dexie";

export interface WordEntry {
  id: string;
  type: "bookmarked" | "learned" | "still-learning";
  timestamp?: number;
}

export interface ActivityEntry {
  date: string;
  quizzesDone: number;
  correctAnswers: number;
}

export interface StateEntry {
  key: string;
  value: string;
  timestamp: number;
}

const LS_PREFIX = "voc_";

export let db: Dexie & {
  words: EntityTable<WordEntry, "id">;
  activity: EntityTable<ActivityEntry, "date">;
  state: EntityTable<StateEntry, "key">;
} | null;

try {
  db = new Dexie("VocabularyDB") as Dexie & {
    words: EntityTable<WordEntry, "id">;
    activity: EntityTable<ActivityEntry, "date">;
    state: EntityTable<StateEntry, "key">;
  };
  db.version(1).stores({ words: "id, type" });
  db.version(2).stores({ words: "id, type", activity: "date" });
  db.version(3).stores({ words: "id, type", activity: "date", state: "key" });
} catch {
  db = null;
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
  const enriched = { ...entry, timestamp: entry.timestamp ?? Date.now() };
  if (db) {
    try {
      await db.words.put(enriched);
    } catch (err) {
      console.error("Dexie put failed:", err);
    }
  }
  localStorage.setItem(LS_PREFIX + entry.id, JSON.stringify(enriched));
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
  const enriched = entries.map((e) => ({ ...e, timestamp: e.timestamp ?? Date.now() }));
  if (db) {
    try {
      await db.words.bulkPut(enriched);
    } catch (err) {
      console.error("Dexie bulkPut failed:", err);
    }
  }
  for (const entry of enriched) {
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

export async function getActivity(date: string): Promise<ActivityEntry | undefined> {
  if (!db) return undefined;
  try {
    return await db.activity.get(date);
  } catch (err) {
    console.error("Dexie getActivity failed:", err);
    return undefined;
  }
}

export async function getAllActivity(): Promise<ActivityEntry[]> {
  if (!db) return [];
  try {
    return await db.activity.toArray();
  } catch (err) {
    console.error("Dexie getAllActivity failed:", err);
    return [];
  }
}

export async function incrementQuizzesDone(date: string): Promise<void> {
  if (!db) return;
  try {
    const existing = await db.activity.get(date);
    await db.activity.put({
      date,
      quizzesDone: (existing?.quizzesDone ?? 0) + 1,
      correctAnswers: existing?.correctAnswers ?? 0,
    });
  } catch (err) {
    console.error("Dexie incrementQuizzesDone failed:", err);
  }
}

export async function addCorrectAnswers(date: string, correctCount: number): Promise<void> {
  if (!db) return;
  try {
    const existing = await db.activity.get(date);
    await db.activity.put({
      date,
      quizzesDone: existing?.quizzesDone ?? 0,
      correctAnswers: (existing?.correctAnswers ?? 0) + correctCount,
    });
  } catch (err) {
    console.error("Dexie addCorrectAnswers failed:", err);
  }
}
