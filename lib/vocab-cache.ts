"use client";

import db from "@/lib/idb";
import type { Word } from "@/lib/data";

export async function getCachedWords(): Promise<Word[]> {
  return db.words.toArray();
}

export async function setCachedWords(words: Word[]): Promise<void> {
  await db.transaction("rw", db.words, async () => {
    await db.words.clear();
    await db.words.bulkAdd(words);
  });
}

export async function getCachedWordsByLevel(level: string): Promise<Word[]> {
  return db.words.where("level").equals(level.toUpperCase()).sortBy("id");
}

export async function getCachedVersion(): Promise<number | null> {
  const entry = await db.metadata.get("vocabularyVersion");
  return entry ? (entry.value as number) : null;
}

export async function setCachedVersion(version: number): Promise<void> {
  await db.metadata.put({ key: "vocabularyVersion", value: version });
}

export async function searchCachedWords(query: string): Promise<Word[]> {
  const q = query.toLowerCase();
  const all = await db.words.toArray();
  return all
    .map((row) => {
      let score = 0;
      const word = row.word.toLowerCase();
      const meaning = row.meaning_bn.toLowerCase();
      const defEn = row.definition_en.toLowerCase();
      const defBn = row.definition_bn.toLowerCase();

      if (word === q) score += 100;
      else if (word.startsWith(q)) score += 50;
      else if (word.includes(q)) score += 20;

      if (meaning === q) score += 80;
      else if (meaning.startsWith(q)) score += 40;
      else if (meaning.includes(q)) score += 15;

      if (defEn.includes(q)) score += 5;
      if (defBn.includes(q)) score += 5;

      return { row, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .map(({ row }) => row);
}
